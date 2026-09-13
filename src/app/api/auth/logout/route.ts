import { NextResponse } from "next/server";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function POST() {
  try {
    await services.auth.logout();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
