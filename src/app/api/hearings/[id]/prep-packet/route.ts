import { NextResponse } from "next/server";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { jsonError } from "@/infrastructure/http/json-error";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await services.subscription.assertFeature(session, "EXPORT_PREP_PACKET");
    const { id } = await context.params;
    const hearing = await services.hearings.get(session, id);
    const lines = [
      "LegalAid — Advisory prep packet (not a court filing)",
      `Matter: ${hearing.case.title}`,
      `Jurisdiction: ${hearing.case.jurisdiction}`,
      `Hearing: ${hearing.title}`,
      "",
      "Transcript:",
      ...hearing.messages.map((m) => `${m.speakerName}: ${m.content}`),
      "",
      hearing.ruling ? `Advisory ruling:\n${hearing.ruling}` : "No ruling recorded yet.",
      "",
      "Disclaimer: For preparation only. Confirm all filings with licensed counsel.",
    ];
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="legalaid-prep-${id}.txt"`,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
