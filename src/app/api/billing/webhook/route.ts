import { NextResponse } from "next/server";
import { getStripeBilling } from "@/infrastructure/billing/factory";
import { jsonError } from "@/infrastructure/http/json-error";

export async function POST(req: Request) {
  try {
    const stripe = getStripeBilling();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured", code: "NOT_CONFIGURED" }, { status: 503 });
    }
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature", code: "BAD_REQUEST" }, { status: 400 });
    }
    const payload = await req.text();
    await stripe.applyWebhookEvent(payload, signature);
    return NextResponse.json({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
