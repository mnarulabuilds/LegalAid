import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const matter = await services.cases.get(session, id);
    return NextResponse.json({ case: matter });
  } catch (error) {
    return jsonError(error);
  }
}
