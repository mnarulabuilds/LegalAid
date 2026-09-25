import { z } from "zod";
import { NextResponse } from "next/server";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(100),
  countryCode: z.string().trim().length(2),
  language: z.string().trim().min(2).max(10),
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
