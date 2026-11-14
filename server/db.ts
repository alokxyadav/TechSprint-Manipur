import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, domains, forecasts, recommendations, trendCache, InsertDomain, InsertForecast, InsertRecommendation, InsertTrendCache } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= User Management =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= Domain Management =============

export async function getAllDomains() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(domains).orderBy(domains.name);
}

export async function getDomainById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(domains).where(eq(domains.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDomainByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(domains).where(eq(domains.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDomain(domain: InsertDomain) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(domains).values(domain);
  return result;
}

// ============= Forecast Management =============

export async function createForecast(forecast: InsertForecast) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(forecasts).values(forecast);
  // Get the last inserted ID
  const result = await db.select({ id: forecasts.id }).from(forecasts).orderBy(desc(forecasts.id)).limit(1);
  return result[0]?.id ?? 0;
}

export async function getForecastById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(forecasts).where(eq(forecasts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserForecasts(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(forecasts)
    .where(eq(forecasts.userId, userId))
    .orderBy(desc(forecasts.createdAt))
    .limit(limit);
}

export async function updateForecastStatus(
  id: number, 
  status: "pending" | "processing" | "completed" | "failed",
  data?: {
    confidence?: number;
    growthRate?: number;
    historicalData?: Array<{ date: string; value: number }>;
    forecastData?: Array<{ date: string; yhat: number; yhat_lower: number; yhat_upper: number }>;
    seasonalityData?: Array<{ month: string; strength: number }>;
    trendData?: {
      relatedQueries: string[];
      risingQueries: string[];
      topQueries: string[];
    };
    errorMessage?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  
  if (data) {
    if (data.confidence !== undefined) updateData.confidence = data.confidence;
    if (data.growthRate !== undefined) updateData.growthRate = data.growthRate;
    if (data.historicalData) updateData.historicalData = data.historicalData;
    if (data.forecastData) updateData.forecastData = data.forecastData;
    if (data.seasonalityData) updateData.seasonalityData = data.seasonalityData;
    if (data.trendData) updateData.trendData = data.trendData;
    if (data.errorMessage) updateData.errorMessage = data.errorMessage;
  }
  
  if (status === "completed") {
    updateData.completedAt = new Date();
  }
  
  await db.update(forecasts).set(updateData).where(eq(forecasts.id, id));
}

// ============= Recommendation Management =============

export async function createRecommendation(recommendation: InsertRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(recommendations).values(recommendation);
  // Get the last inserted ID
  const result = await db.select({ id: recommendations.id }).from(recommendations).orderBy(desc(recommendations.id)).limit(1);
  return result[0]?.id ?? 0;
}

export async function getRecommendationsByForecastId(forecastId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.forecastId, forecastId))
    .orderBy(desc(recommendations.priority), desc(recommendations.confidenceScore));
}

// ============= Trend Cache Management =============

export async function getCachedTrend(keyword: string, domainCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const now = new Date();
  const result = await db
    .select()
    .from(trendCache)
    .where(
      and(
        eq(trendCache.keyword, keyword),
        eq(trendCache.domainCode, domainCode)
      )
    )
    .limit(1);
  
  if (result.length === 0) return undefined;
  
  const cached = result[0];
  if (!cached) return undefined;
  
  // Check if cache is expired
  if (cached.expiresAt < now) {
    return undefined;
  }
  
  return cached;
}

export async function saveTrendCache(cache: InsertTrendCache) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(trendCache).values(cache);
}
