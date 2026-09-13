import { notFound } from "next/navigation";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { Courtroom } from "@/ui/courtroom";

export default async function HearingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  try {
    const hearing = await services.hearings.get(user, id);
    return (
      <Courtroom
        hearingId={hearing.id}
        title={hearing.title}
        status={hearing.status}
        language={user.language}
        caseTitle={hearing.case.title}
        messages={hearing.messages.map((m) => ({
          id: m.id,
          speakerType: m.speakerType,
          speakerName: m.speakerName,
          content: m.content,
        }))}
        ruling={hearing.ruling}
      />
    );
  } catch {
    notFound();
  }
}
