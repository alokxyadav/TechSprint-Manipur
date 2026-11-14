import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("domains", () => {
  it("should list all domains", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const domains = await caller.domains.list();

    expect(Array.isArray(domains)).toBe(true);
    expect(domains.length).toBeGreaterThan(0);
    
    // Check that IT domain exists
    const itDomain = domains.find(d => d.code === "IT");
    expect(itDomain).toBeDefined();
    expect(itDomain?.name).toBe("IT & Software Services");
  });

  it("should get domain by code", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const domain = await caller.domains.getByCode({ code: "Healthcare" });

    expect(domain).toBeDefined();
    expect(domain?.name).toBe("Healthcare & MedTech");
    expect(domain?.icon).toBe("🏥");
  });
});

describe("forecasts", () => {
  it("should create a forecast request", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get IT domain
    const domains = await caller.domains.list();
    const itDomain = domains.find(d => d.code === "IT");
    
    if (!itDomain) {
      throw new Error("IT domain not found");
    }

    const result = await caller.forecasts.create({
      domainId: itDomain.id,
      keyword: "cloud computing",
      forecastMonths: 12,
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("processing");
    expect(result.forecastId).toBeGreaterThan(0);
    expect(result.message).toContain("Forecast is being generated");
  });

  it("should get dashboard data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const dashboard = await caller.forecasts.dashboard();

    expect(dashboard).toBeDefined();
    expect(dashboard.stats).toBeDefined();
    expect(dashboard.recentForecasts).toBeDefined();
    expect(Array.isArray(dashboard.recentForecasts)).toBe(true);
  });

  it("should reject forecast creation without authentication", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.forecasts.create({
        domainId: 1,
        keyword: "test",
        forecastMonths: 12,
      })
    ).rejects.toThrow();
  });
});

describe("domain keyword intelligence", () => {
  it("should have AgriTech domain with tea garden keywords", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const domain = await caller.domains.getByCode({ code: "AgriTech" });

    expect(domain).toBeDefined();
    expect(domain?.name).toContain("AgriTech");
    expect(Array.isArray(domain?.keywords)).toBe(true);
    
    const keywords = domain?.keywords as string[];
    
    // Check for tea garden specific keywords
    const teaKeywords = keywords.filter(k => 
      k.toLowerCase().includes("tea")
    );
    
    expect(teaKeywords.length).toBeGreaterThan(0);
    expect(keywords).toContain("tea plantation management");
    expect(keywords).toContain("tea garden technology");
  });

  it("should have all 7 domains configured", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const domains = await caller.domains.list();

    const expectedDomains = [
      "IT",
      "Healthcare", 
      "EV",
      "OTT",
      "Biotech",
      "AgriTech",
      "Restaurant"
    ];

    for (const code of expectedDomains) {
      const domain = domains.find(d => d.code === code);
      expect(domain).toBeDefined();
      expect(domain?.keywords).toBeDefined();
      expect((domain?.keywords as string[]).length).toBeGreaterThan(0);
    }
  });
});
