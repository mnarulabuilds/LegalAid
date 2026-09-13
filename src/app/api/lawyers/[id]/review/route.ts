import { z } from "zod";
import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(8),
});

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const body = schema.parse(await req.json());
    const review = await services.lawyers.review(session, id, body.rating, body.comment);
    return NextResponse.json({ review });
  } catch (error) {
    return jsonError(error);
  }
}
