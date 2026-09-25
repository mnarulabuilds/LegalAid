import { startOfMonth } from "date-fns";
import { prisma } from "@/infrastructure/db/prisma";
import { SubscriptionRequiredError } from "@/domain/errors";
import type { SubscriptionPlan } from "@/domain/subscription/plans";
import { PLAN_CATALOG } from "@/domain/subscription/plans";
import {
  buildEntitlements,
  featureAllowed,
  upgradeMessage,
  type Entitlements,
  type SubscriptionFeature,
} from "@/domain/subscription/entitlements";
import type { SessionUser } from "@/domain/policies/authorization";
import type { BillingPort } from "@/infrastructure/billing/billing-port";

export class SubscriptionService {
  constructor(private readonly billing: BillingPort) {}

  catalog() {
    return PLAN_CATALOG;
  }

  billingConfigured() {
    return this.billing.isConfigured();
  }

  private effectivePlan(user: { role: string; subscriptionPlan: SubscriptionPlan; subscriptionStatus: string }): SubscriptionPlan {
    if (user.role === "ADMIN") return "PRO";
    if (user.subscriptionStatus === "ACTIVE" || user.subscriptionStatus === "TRIALING") {
      return user.subscriptionPlan;
    }
    return user.subscriptionPlan === "PRO" ? "FREE" : user.subscriptionPlan;
  }

  async getEntitlements(userId: string): Promise<Entitlements> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new SubscriptionRequiredError("Account not found", "NOT_FOUND");
    const monthStart = startOfMonth(new Date());
    const [openCases, hearingsThisMonth, doubtsThisMonth, libraryExplainsThisMonth] = await Promise.all([
      prisma.case.count({
        where: { plaintiffId: userId, status: { not: "CLOSED" } },
      }),
      prisma.hearing.count({
        where: {
          createdAt: { gte: monthStart },
          OR: [{ parties: { some: { userId } } }, { case: { plaintiffId: userId } }],
        },
      }),
      prisma.doubt.count({ where: { userId, createdAt: { gte: monthStart } } }),
      prisma.usageEvent.count({
        where: { userId, kind: "LIBRARY_EXPLAIN", createdAt: { gte: monthStart } },
      }),
    ]);
    const plan = this.effectivePlan(user);
    return buildEntitlements(plan, {
      openCases,
      hearingsThisMonth,
      doubtsThisMonth,
      libraryExplainsThisMonth,
    });
  }

  async assertFeature(user: SessionUser, feature: SubscriptionFeature): Promise<Entitlements> {
    if (user.role === "ADMIN" || user.role === "LAWYER") {
      return buildEntitlements("PRO", {
        openCases: 0,
        hearingsThisMonth: 0,
        doubtsThisMonth: 0,
        libraryExplainsThisMonth: 0,
      });
    }
    const entitlements = await this.getEntitlements(user.id);
    if (!featureAllowed(entitlements, feature)) {
      throw new SubscriptionRequiredError(upgradeMessage(feature));
    }
    return entitlements;
  }

  async recordUsage(userId: string, kind: "LIBRARY_EXPLAIN") {
    await prisma.usageEvent.create({ data: { userId, kind } });
  }

  async createCheckout(user: SessionUser, origin: string) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new SubscriptionRequiredError("Account not found");
    return this.billing.createCheckoutSession({
      userId: user.id,
      email: dbUser.email,
      successUrl: `${origin}/settings?billing=success`,
      cancelUrl: `${origin}/settings?billing=cancel`,
    });
  }

  async createPortal(user: SessionUser, origin: string) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.stripeCustomerId) {
      throw new SubscriptionRequiredError("No billing profile yet. Start a Pro subscription first.");
    }
    return this.billing.createPortalSession({
      customerId: dbUser.stripeCustomerId,
      returnUrl: `${origin}/settings`,
    });
  }

  async getBillingSummary(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new SubscriptionRequiredError("Account not found");
    const entitlements = await this.getEntitlements(userId);
    return {
      plan: entitlements.plan,
      status: user.subscriptionStatus,
      periodEnd: user.subscriptionPeriodEnd,
      entitlements,
      catalog: PLAN_CATALOG,
      billingConfigured: this.billing.isConfigured(),
    };
  }
}
