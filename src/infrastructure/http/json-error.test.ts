import { describe, expect, it } from "vitest";
import { z } from "zod";
import { DomainError } from "@/domain/errors";
import { jsonError } from "./json-error";

describe("jsonError", () => {
  it("maps domain errors to json responses", async () => {
    const res = jsonError(new DomainError("nope", "NOPE", 418));
    expect(res.status).toBe(418);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("NOPE");
  });

  it("maps zod errors to 400 via safe parse", async () => {
    const parsed = z.object({ x: z.string() }).safeParse({});
    if (!parsed.success) {
      const res = jsonError(parsed.error);
      expect(res.status).toBe(400);
    }
  });

  it("maps unknown errors to 500", async () => {
    const res = jsonError(new Error("boom"));
    expect(res.status).toBe(500);
  });
});
