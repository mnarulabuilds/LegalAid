import Link from "next/link";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { LawyerProfileForm } from "@/ui/lawyer-profile-form";

export default async function LawyersPage() {
  const user = await requireSession();
  const lawyers = await services.lawyers.list();
  const ranked = await services.lawyers.recommend({
    category: "CIVIL",
    jurisdiction: user.countryCode,
    language: user.language,
  });
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">Counsel</p>
        <h1 className="display mt-2 text-4xl">The bar, ranked for {user.countryCode}</h1>
      </header>
      {user.role === "LAWYER" ? <LawyerProfileForm /> : null}
      <ul className="grid gap-4 md:grid-cols-2">
        {lawyers.map((lawyer) => {
          const score = ranked.find((r) => r.id === lawyer.id)?.score;
          return (
            <li key={lawyer.id} className="panel rounded-2xl p-5">
              <p className="text-xs uppercase tracking-widest text-[#b08d3e]">
                {lawyer.verified ? "Verified" : "Pending verification"} · {lawyer.yearsExperience} yrs
              </p>
              <Link href={`/lawyers/${lawyer.id}`} className="display mt-1 block text-2xl">
                {lawyer.name}
              </Link>
              <p className="text-sm text-[#3d4a45]">{lawyer.firmName}</p>
              <p className="mt-3 text-sm">{lawyer.bio}</p>
              <p className="mt-3 text-sm">
                {lawyer.stats.winRate}% wins · {lawyer.stats.resolutionRate}% resolved · rating {lawyer.rating.toFixed(1)}
                {score ? ` · match ${score}` : ""}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-[#3d4a45]">
                {lawyer.specialties.join(" · ")} · {lawyer.jurisdictions.join(", ")}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
