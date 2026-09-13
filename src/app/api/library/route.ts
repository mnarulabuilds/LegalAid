import { NextResponse } from "next/server";
import { readSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function GET(req: Request) {
  try {
    const session = await readSession();
    const url = new URL(req.url);
    const query = url.searchParams.get("q") ?? "";
    const jurisdiction = url.searchParams.get("jurisdiction") ?? session?.countryCode ?? "IN";
    const locale = url.searchParams.get("locale") ?? session?.language ?? "en";
    const kind = url.searchParams.get("kind") ?? undefined;
    const mode = url.searchParams.get("mode") ?? "search";
    if (mode === "browse" && !query) {
      const instruments = await services.knowledge.list({ jurisdiction, kind });
      return NextResponse.json({ instruments, jurisdiction, locale });
    }
    const results = await services.knowledge.search({ query, jurisdiction, locale, kind });
    return NextResponse.json({ results, jurisdiction, locale });
  } catch (error) {
    return jsonError(error);
  }
}
