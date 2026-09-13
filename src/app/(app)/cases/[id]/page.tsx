import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { CaseActions } from "@/ui/case-actions";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  try {
    const matter = await services.cases.get(user, id);
    const recs = await services.lawyers.recommend({
      category: matter.category,
      jurisdiction: matter.jurisdiction,
      language: user.language,
    });
    return (
      <article className="space-y-6">
        <Link href="/cases" className="text-sm underline">
          Back to the cause list
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">
          {matter.status.replaceAll("_", " ")} · {matter.category} · {matter.jurisdiction}
        </p>
        <h1 className="display text-4xl">{matter.title}</h1>
        <p className="max-w-3xl leading-7">{matter.description}</p>
        <p className="text-sm text-[#3d4a45]">
          Against {matter.opposingParty}. Prayer: {matter.reliefSought}. Counsel: {matter.assignedLawyer?.name ?? "unassigned"}.
        </p>
        <CaseActions caseId={matter.id} lawyers={recs.slice(0, 6)} />
        <section className="panel rounded-2xl p-6">
          <h2 className="display text-2xl">Timeline</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {matter.timeline.map((event) => (
              <li key={event.id}>
                <span className="font-medium">{event.actor}</span> — {event.message}
              </li>
            ))}
          </ul>
        </section>
      </article>
    );
  } catch {
    notFound();
  }
}
