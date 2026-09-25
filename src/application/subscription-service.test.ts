import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriptionService } from "./subscription-service";
import type { BillingPort } from "@/infrastructure/billing/billing-port";

const billing: BillingPort = {
  isConfigured: () => true,
  createCheckoutSession: vi.fn(async () => ({ url: "https://checkout.test", sessionId: "cs_test" })),
  createPortalSession: vi.fn(async () => ({ url: "https://portal.test" })),
};

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async () => ({
        id: "u1",
        email: "c@test",
        role: "CITIZEN",
        subscriptionPlan: "FREE",
        subscriptionStatus: "NONE",
      })),
    },
    case: { count: vi.fn(async () => 0) },
    hearing: { count: vi.fn(async () => 0) },
    doubt: { count: vi.fn(async () => 0) },
    usageEvent: { count: vi.fn(async () => 0), create: vi.fn(async () => ({})) },
  },
}));

describe("SubscriptionService", () => {
  const service = new SubscriptionService(billing);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns entitlements for citizens", async () => {
    const ent = await service.getEntitlements("u1");
    expect(ent.plan).toBe("FREE");
  });

  it("bypasses limits for lawyers", async () => {
    const lawyer = { id: "l1", email: "l@test", name: "L", role: "LAWYER" as const, countryCode: "IN", language: "en" };
    const ent = await service.assertFeature(lawyer, "CREATE_CASE");
    expect(ent.isPro).toBe(true);
  });

  it("creates checkout sessions", async () => {
    const user = { id: "u1", email: "c@test", name: "C", role: "CITIZEN" as const, countryCode: "IN", language: "en" };
    const session = await service.createCheckout(user, "http://localhost:3000");
    expect(session.url).toContain("checkout");
  });

  it("returns billing summary", async () => {
    const summary = await service.getBillingSummary("u1");
    expect(summary.plan).toBe("FREE");
    expect(summary.catalog.PRO.monthlyUsd).toBe(29);
  });

  it("opens billing portal when customer exists", async () => {
    const { prisma } = await import("@/infrastructure/db/prisma");
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "c@test",
      role: "CITIZEN",
      subscriptionPlan: "PRO",
      subscriptionStatus: "ACTIVE",
      stripeCustomerId: "cus_123",
    } as never);
    const user = { id: "u1", email: "c@test", name: "C", role: "CITIZEN" as const, countryCode: "IN", language: "en" };
    const portal = await service.createPortal(user, "http://localhost:3000");
    expect(portal.url).toContain("portal");
  });

  it("blocks citizens over free limits", async () => {
    const { prisma } = await import("@/infrastructure/db/prisma");
    vi.mocked(prisma.case.count).mockResolvedValueOnce(1);
    const user = { id: "u1", email: "c@test", name: "C", role: "CITIZEN" as const, countryCode: "IN", language: "en" };
    await expect(service.assertFeature(user, "CREATE_CASE")).rejects.toMatchObject({ code: "SUBSCRIPTION_REQUIRED" });
  });
});
