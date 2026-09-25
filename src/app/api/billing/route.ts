import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function GET() {
  try {
    const session = await requireSession();
    const summary = await services.subscription.getBillingSummary(session.id);
    return NextResponse.json(summary);
  } catch (error) {
    return jsonError(error);
  }
}
