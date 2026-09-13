import { z } from "zod";
import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

const schema = z.object({ content: z.string().min(8) });

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const body = schema.parse(await req.json());
    const hearing = await services.hearings.speak(session, id, body.content);
    return NextResponse.json({ hearing });
  } catch (error) {
    return jsonError(error);
  }
}
