import { NextResponse } from "next/server";
import { DomainError } from "@/domain/errors";
import { z } from "zod";

export function jsonError(error: unknown) {
  if (error instanceof DomainError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input", code: "VALIDATION" }, { status: 400 });
  }
  console.error(error);
  return NextResponse.json({ error: "Unexpected error", code: "INTERNAL" }, { status: 500 });
}
