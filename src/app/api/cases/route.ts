import { z } from "zod";
import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";
import { CASE_CATEGORIES } from "@/domain/catalog";

export async function GET() {
  try {
    const session = await requireSession();
    const cases = await services.cases.list(session);
    return NextResponse.json({ cases });
  } catch (error) {
    return jsonError(error);
  }
}

const schema = z.object({
  title: z.string().min(4),
  description: z.string().min(20),
  category: z.enum(CASE_CATEGORIES),
  opposingParty: z.string().min(2),
  reliefSought: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = schema.parse(await req.json());
    const matter = await services.cases.create(session, body);
    return NextResponse.json({ case: matter });
  } catch (error) {
    return jsonError(error);
  }
}
