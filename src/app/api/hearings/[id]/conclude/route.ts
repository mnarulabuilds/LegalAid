import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const hearing = await services.hearings.conclude(session, id);
    return NextResponse.json({ hearing });
  } catch (error) {
    return jsonError(error);
  }
}
