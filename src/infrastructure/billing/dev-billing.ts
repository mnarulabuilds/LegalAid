import type { BillingPort, BillingPortalResult, CheckoutSessionResult } from "./billing-port";

/** Local-only billing when Stripe keys are absent. */
export class DevBilling implements BillingPort {
  isConfigured(): boolean {
    return process.env.NODE_ENV !== "production";
  }

  async createCheckoutSession(input: {
    userId: string;
    email: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSessionResult> {
    const { prisma } = await import("@/infrastructure/db/prisma");
    await prisma.user.update({
      where: { id: input.userId },
      data: {
        subscriptionPlan: "PRO",
        subscriptionStatus: "ACTIVE",
        subscriptionPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return {
      url: `${input.successUrl}${input.successUrl.includes("?") ? "&" : "?"}upgraded=1`,
      sessionId: `dev_${input.userId}`,
    };
  }

  async createPortalSession(input: { returnUrl: string }): Promise<BillingPortalResult> {
    return { url: input.returnUrl };
  }
}
