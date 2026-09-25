import type { BillingPort } from "./billing-port";
import { DevBilling } from "./dev-billing";
import { StripeBilling } from "./stripe-billing";

let billing: BillingPort | null = null;

export function createBillingProvider(): BillingPort {
  if (billing) return billing;
  const stripe = new StripeBilling();
  billing = stripe.isConfigured() ? stripe : new DevBilling();
  return billing;
}

export function getStripeBilling(): StripeBilling | null {
  const stripe = new StripeBilling();
  return stripe.isConfigured() ? stripe : null;
}
