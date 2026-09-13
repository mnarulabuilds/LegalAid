import { z } from "zod";
import { NextResponse } from "next/server";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(["CITIZEN", "LAWYER"]),
  countryCode: z.string().min(2),
  language: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await services.auth.register(body);
    return NextResponse.json({ user });
  } catch (error) {
    return jsonError(error);
  }
}
