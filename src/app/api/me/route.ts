import { z } from "zod";
import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function GET() {
  try {
    const session = await requireSession();
    const profile = await services.auth.getProfile(session.id);
    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        countryCode: profile.countryCode,
        language: profile.language,
        lawyerProfile: profile.lawyerProfile,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

const patchSchema = z.object({
  countryCode: z.string().min(2).optional(),
  language: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = patchSchema.parse(await req.json());
    const user = await services.auth.updatePreferences(session.id, body);
    return NextResponse.json({ user });
  } catch (error) {
    return jsonError(error);
  }
}
