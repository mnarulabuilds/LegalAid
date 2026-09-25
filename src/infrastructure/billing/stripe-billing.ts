import Stripe from "stripe";
import type { BillingPort, BillingPortalResult, CheckoutSessionResult } from "./billing-port";

export class StripeBilling implements BillingPort {
  private readonly stripe: Stripe | null;
  private readonly priceId: string | null;

  constructor() {
    const secret = process.env.STRIPE_SECRET_KEY;
    this.priceId = process.env.STRIPE_PRO_PRICE_ID ?? null;
    this.stripe = secret && secret.length > 8 ? new Stripe(secret) : null;
  }

  isConfigured(): boolean {
    return Boolean(this.stripe && this.priceId);
  }

  private client(): Stripe {
    if (!this.stripe) throw new Error("Stripe is not configured");
    return this.stripe;
  }

  async createCheckoutSession(input: {
    userId: string;
    email: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSessionResult> {
    const stripe = this.client();
    if (!this.priceId) throw new Error("STRIPE_PRO_PRICE_ID is not configured");
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: input.email,
      line_items: [{ price: this.priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: { userId: input.userId },
      subscription_data: {
        metadata: { userId: input.userId },
      },
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url, sessionId: session.id };
  }

  async createPortalSession(input: { customerId: string; returnUrl: string }): Promise<BillingPortalResult> {
    const stripe = this.client();
    const session = await stripe.billingPortal.sessions.create({
      customer: input.customerId,
      return_url: input.returnUrl,
    });
    return { url: session.url };
  }

  async applyWebhookEvent(payload: string, signature: string): Promise<void> {
    const stripe = this.client();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    const { prisma } = await import("@/infrastructure/db/prisma");

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionPlan: "PRO",
            subscriptionStatus: "ACTIVE",
            stripeCustomerId: customerId ?? undefined,
            stripeSubscriptionId: subscriptionId ?? undefined,
          },
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        const active = sub.status === "active" || sub.status === "trialing";
        const periodEndSeconds = (sub as Stripe.Subscription & { current_period_end?: number }).current_period_end;
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionPlan: active ? "PRO" : "FREE",
            subscriptionStatus: active ? (sub.status === "trialing" ? "TRIALING" : "ACTIVE") : "CANCELED",
            subscriptionPeriodEnd: periodEndSeconds ? new Date(periodEndSeconds * 1000) : undefined,
            stripeSubscriptionId: sub.id,
          },
        });
        break;
      }
      default:
        break;
    }
  }
}
