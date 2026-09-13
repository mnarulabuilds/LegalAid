import { z } from "zod";
import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

const schema = z.object({
  barNumber: z.string().min(3),
  firmName: z.string().optional(),
  bio: z.string().min(20),
  specialties: z.string().min(3),
  yearsExperience: z.number().int().min(0),
  hourlyRateUsd: z.number().int().min(0),
  languagesSpoken: z.string().min(2),
  jurisdictions: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = schema.parse(await req.json());
    const profile = await services.lawyers.upsertOwn(session, body);
    return NextResponse.json({ profile });
  } catch (error) {
    return jsonError(error);
  }
}
