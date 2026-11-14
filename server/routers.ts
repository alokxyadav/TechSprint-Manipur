import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as aiService from "./services/aiService";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Domain management
  domains: router({
    list: publicProcedure.query(async () => {
      const domains = await db.getAllDomains();
      return domains;
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const domain = await db.getDomainById(input.id);
        if (!domain) {
          throw new Error("Domain not found");
        }
        return domain;
      }),

    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const domain = await db.getDomainByCode(input.code);
        if (!domain) {
          throw new Error("Domain not found");
        }
        return domain;
      }),
  }),

  // Forecast management
  forecasts: router({
    // Create and run a new forecast
    create: protectedProcedure
      .input(
        z.object({
          domainId: z.number(),
          keyword: z.string().min(1),
          forecastMonths: z.number().min(1).max(24).default(12),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get domain info
        const domain = await db.getDomainById(input.domainId);
        if (!domain) {
          throw new Error("Domain not found");
        }

        // Create forecast record
        const forecastId = await db.createForecast({
          userId: ctx.user.id,
          domainId: input.domainId,
          keyword: input.keyword,
          forecastMonths: input.forecastMonths,
          status: "processing",
        });

        // Run AI forecast asynchronously (in production, use a job queue)
        setImmediate(async () => {
          try {
            const result = await aiService.runCompleteForecast(
              domain.code,
              input.keyword,
              input.forecastMonths
            );

            if (!result.success || !result.trendData || !result.forecastResult) {
              await db.updateForecastStatus(forecastId, "failed", {
                errorMessage: result.error || "Failed to generate forecast",
              });
              return;
            }

            // Update forecast with results
            await db.updateForecastStatus(forecastId, "completed", {
              confidence: result.forecastResult.confidence,
              growthRate: result.forecastResult.growth_rate,
              historicalData: result.trendData.time_series,
              forecastData: result.forecastResult.forecast_data,
              seasonalityData: result.forecastResult.seasonality_data,
              trendData: {
                relatedQueries: result.trendData.related_queries?.top || [],
                risingQueries: result.trendData.related_queries?.rising || [],
                topQueries: result.trendData.related_queries?.top || [],
              },
            });

            // Generate and save recommendations
            if (result.recommendations?.success && result.recommendations.recommendations) {
              for (const rec of result.recommendations.recommendations) {
                await db.createRecommendation({
                  forecastId,
                  title: rec.title,
                  description: rec.description,
                  category: rec.category,
                  priority: rec.priority,
                  confidenceScore: rec.confidence_score,
                  impactScore: rec.impact_score,
                  bestMonths: rec.best_months,
                  avoidMonths: rec.avoid_months,
                  reasoning: rec.reasoning,
                  actionItems: rec.action_items,
                });
              }
            }
          } catch (error: any) {
            console.error("[Forecast] Error processing forecast:", error);
            await db.updateForecastStatus(forecastId, "failed", {
              errorMessage: error.message || "Unknown error occurred",
            });
          }
        });

        return {
          forecastId,
          status: "processing",
          message: "Forecast is being generated. This may take 30-60 seconds.",
        };
      }),

    // Get forecast by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const forecast = await db.getForecastById(input.id);
        
        if (!forecast) {
          throw new Error("Forecast not found");
        }

        // Check ownership
        if (forecast.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        return forecast;
      }),

    // Get user's forecasts
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        const forecasts = await db.getUserForecasts(ctx.user.id, input?.limit);
        return forecasts;
      }),

    // Get dashboard data (recent forecasts with summary stats)
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      const forecasts = await db.getUserForecasts(ctx.user.id, 10);
      
      const completed = forecasts.filter(f => f.status === "completed");
      const avgGrowth = completed.length > 0
        ? completed.reduce((sum, f) => sum + (f.growthRate || 0), 0) / completed.length
        : 0;
      
      const avgConfidence = completed.length > 0
        ? completed.reduce((sum, f) => sum + (f.confidence || 0), 0) / completed.length
        : 0;

      return {
        recentForecasts: forecasts,
        stats: {
          total: forecasts.length,
          completed: completed.length,
          processing: forecasts.filter(f => f.status === "processing").length,
          failed: forecasts.filter(f => f.status === "failed").length,
          avgGrowthRate: avgGrowth,
          avgConfidence: avgConfidence,
        },
      };
    }),
  }),

  // Recommendations
  recommendations: router({
    // Get recommendations for a forecast
    getByForecastId: protectedProcedure
      .input(z.object({ forecastId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify forecast ownership
        const forecast = await db.getForecastById(input.forecastId);
        if (!forecast) {
          throw new Error("Forecast not found");
        }
        if (forecast.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const recommendations = await db.getRecommendationsByForecastId(input.forecastId);
        return recommendations;
      }),
  }),
});

export type AppRouter = typeof appRouter;
