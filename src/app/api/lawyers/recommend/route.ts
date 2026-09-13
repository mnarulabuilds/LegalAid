import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const url = new URL(req.url);
    const category = url.searchParams.get("category") ?? "CIVIL";
    const jurisdiction = url.searchParams.get("jurisdiction") ?? session.countryCode;
    const language = url.searchParams.get("language") ?? session.language;
    const lawyers = await services.lawyers.recommend({ category, jurisdiction, language });
    return NextResponse.json({ lawyers });
  } catch (error) {
    return jsonError(error);
  }
}
