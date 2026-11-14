import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, float, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Domain configurations for the 7 supported verticals
 */
export const domains = mysqlTable("domains", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  keywords: json("keywords").$type<string[]>().notNull(),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Domain = typeof domains.$inferSelect;
export type InsertDomain = typeof domains.$inferInsert;

/**
 * Forecast results from Prophet ML model
 */
export const forecasts = mysqlTable("forecasts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  domainId: int("domainId").notNull(),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  
  // Forecast metadata
  forecastMonths: int("forecastMonths").default(12).notNull(),
  confidence: float("confidence"),
  growthRate: float("growthRate"),
  
  // Time series data
  historicalData: json("historicalData").$type<Array<{ date: string; value: number }>>(),
  forecastData: json("forecastData").$type<Array<{ date: string; yhat: number; yhat_lower: number; yhat_upper: number }>>(),
  
  // Seasonality insights
  seasonalityData: json("seasonalityData").$type<Array<{ month: string; strength: number }>>(),
  
  // Trend intelligence
  trendData: json("trendData").$type<{
    relatedQueries: string[];
    risingQueries: string[];
    topQueries: string[];
  }>(),
  
  errorMessage: text("errorMessage"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = typeof forecasts.$inferInsert;

/**
 * AI-generated recommendations based on forecast results
 */
export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  forecastId: int("forecastId").notNull(),
  
  // Recommendation content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["production", "marketing", "risk", "timing", "strategy"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  
  // Metrics
  confidenceScore: float("confidenceScore").notNull(),
  impactScore: float("impactScore"),
  
  // Timing recommendations
  bestMonths: json("bestMonths").$type<string[]>(),
  avoidMonths: json("avoidMonths").$type<string[]>(),
  
  // Additional insights
  reasoning: text("reasoning"),
  actionItems: json("actionItems").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

/**
 * Cache table for Google Trends data to reduce API calls
 */
export const trendCache = mysqlTable("trendCache", {
  id: int("id").autoincrement().primaryKey(),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  domainCode: varchar("domainCode", { length: 50 }).notNull(),
  
  // Cached trend data
  trendData: json("trendData").$type<Array<{ date: string; value: number }>>(),
  relatedQueries: json("relatedQueries").$type<string[]>(),
  
  // Cache metadata
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrendCache = typeof trendCache.$inferSelect;
export type InsertTrendCache = typeof trendCache.$inferInsert;
