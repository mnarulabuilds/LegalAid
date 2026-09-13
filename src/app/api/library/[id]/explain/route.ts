import { z } from "zod";
import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

const schema = z.object({ question: z.string().default("") });

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const body = schema.parse(await req.json().catch(() => ({ question: "" })));
    const explanation = await services.knowledge.explain(session, id, body.question);
    return NextResponse.json({ explanation });
  } catch (error) {
    return jsonError(error);
  }
}
