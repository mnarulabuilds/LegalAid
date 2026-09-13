import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { DoubtDesk } from "@/ui/doubt-desk";

export default async function DoubtsPage() {
  const user = await requireSession();
  const doubts = await services.knowledge.myDoubts(user.id);
  return (
    <DoubtDesk
      language={user.language}
      jurisdiction={user.countryCode}
      history={doubts.map((d) => ({
        id: d.id,
        question: d.question,
        answer: d.answer,
        category: d.category,
      }))}
    />
  );
}
