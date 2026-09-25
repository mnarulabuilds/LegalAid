import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const origin = new URL(req.url).origin;
    const portal = await services.subscription.createPortal(session, origin);
    return NextResponse.json(portal);
  } catch (error) {
    return jsonError(error);
  }
}
