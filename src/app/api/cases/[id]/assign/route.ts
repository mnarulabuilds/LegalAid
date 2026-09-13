import { z } from "zod";
import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

const schema = z.object({ lawyerUserId: z.string().min(1) });

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const body = schema.parse(await req.json());
    const matter = await services.cases.assignLawyer(session, id, body.lawyerUserId);
    return NextResponse.json({ case: matter });
  } catch (error) {
    return jsonError(error);
  }
}
