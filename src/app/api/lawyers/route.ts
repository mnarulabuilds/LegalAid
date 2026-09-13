import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function GET() {
  try {
    await requireSession();
    const lawyers = await services.lawyers.list();
    return NextResponse.json({ lawyers });
  } catch (error) {
    return jsonError(error);
  }
}
