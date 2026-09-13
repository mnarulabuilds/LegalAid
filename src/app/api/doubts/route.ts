import { z } from "zod";
import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function GET() {
  try {
    const session = await requireSession();
    const doubts = await services.knowledge.myDoubts(session.id);
    return NextResponse.json({ doubts });
  } catch (error) {
    return jsonError(error);
  }
}

const schema = z.object({
  question: z.string().min(8),
  category: z.string().min(3).default("CIVIL"),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = schema.parse(await req.json());
    const doubt = await services.knowledge.ask(session, body.question, body.category);
    return NextResponse.json({ doubt });
  } catch (error) {
    return jsonError(error);
  }
}
