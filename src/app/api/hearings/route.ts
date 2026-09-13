import { z } from "zod";
import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function GET() {
  try {
    const session = await requireSession();
    const hearings = await services.hearings.list(session);
    return NextResponse.json({ hearings });
  } catch (error) {
    return jsonError(error);
  }
}

const schema = z.object({
  caseId: z.string().min(1),
  title: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = schema.parse(await req.json());
    const hearing = await services.hearings.open(session, body.caseId, body.title);
    return NextResponse.json({ hearing });
  } catch (error) {
    return jsonError(error);
  }
}
