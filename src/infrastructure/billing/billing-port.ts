export type CheckoutSessionResult = {
  url: string;
  sessionId: string;
};

export type BillingPortalResult = {
  url: string;
};

export interface BillingPort {
  isConfigured(): boolean;
  createCheckoutSession(input: {
    userId: string;
    email: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSessionResult>;
  createPortalSession(input: { customerId: string; returnUrl: string }): Promise<BillingPortalResult>;
}
