import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await context.params;
    const lawyer = await services.lawyers.get(id);
    return NextResponse.json({ lawyer });
  } catch (error) {
    return jsonError(error);
  }
}
