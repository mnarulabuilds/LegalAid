import { notFound } from "next/navigation";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { ReviewForm } from "@/ui/review-form";

export default async function LawyerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  try {
    const lawyer = await services.lawyers.get(id);
    return (
      <article className="space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">
          {lawyer.verified ? "Verified counsel" : "Unverified"} · {lawyer.barNumber}
        </p>
        <h1 className="display text-4xl">{lawyer.name}</h1>
        <p className="text-[#3d4a45]">{lawyer.firmName}</p>
        <p className="max-w-3xl leading-7">{lawyer.bio}</p>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["Wins", lawyer.wins],
            ["Losses", lawyer.losses],
            ["Settlements", lawyer.settlements],
            ["Win rate", `${lawyer.stats.winRate}%`],
          ].map(([k, v]) => (
            <div key={String(k)} className="panel rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest text-[#b08d3e]">{k}</p>
              <p className="display mt-1 text-2xl">{v}</p>
            </div>
          ))}
        </div>
        <ReviewForm lawyerId={lawyer.id} />
        <section>
          <h2 className="display text-2xl">Client notes</h2>
          <ul className="mt-3 space-y-2">
            {lawyer.reviews.map((review) => (
              <li key={review.id} className="panel rounded-xl p-4">
                <p className="text-sm">
                  {review.author.name} · {review.rating}/5
                </p>
                <p className="mt-1">{review.comment}</p>
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
