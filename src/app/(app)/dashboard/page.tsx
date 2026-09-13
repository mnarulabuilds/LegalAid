import Link from "next/link";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { t } from "@/infrastructure/i18n/dictionaries";

export default async function DashboardPage() {
  const user = await requireSession();
  const copy = t(user.language);
  const [cases, lawyers, library] = await Promise.all([
    services.cases.list(user),
    services.lawyers.recommend({
      category: "EMPLOYMENT",
      jurisdiction: user.countryCode,
      language: user.language,
    }),
    services.knowledge.search({
      query: "constitution rights",
      jurisdiction: user.countryCode,
      locale: user.language,
    }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">{copy.dashboard}</p>
        <h1 className="display mt-2 text-4xl">Good day, {user.name.split(" ")[0]}.</h1>
        <p className="mt-2 text-[#3d4a45]">
          Jurisdiction {user.countryCode}. Interface {user.language}. {copy.disclaimer}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          [copy.cases, `${cases.length} open on the board`, "/cases"],
          [copy.lawyers, `${lawyers.length} ranked for you`, "/lawyers"],
          [copy.library, `${library.length} texts in view`, "/library"],
        ].map(([label, value, href]) => (
          <Link key={href} href={href} className="panel rounded-2xl p-5">
            <p className="text-sm text-[#3d4a45]">{label}</p>
            <p className="display mt-2 text-2xl">{value}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel rounded-2xl p-6">
          <h2 className="display text-2xl">Recent matters</h2>
          <ul className="mt-4 space-y-3">
            {cases.slice(0, 4).map((matter) => (
              <li key={matter.id}>
                <Link href={`/cases/${matter.id}`} className="underline">
                  {matter.title}
                </Link>
                <p className="text-sm text-[#3d4a45]">
                  {matter.status.replaceAll("_", " ")} · {matter.category}
                </p>
              </li>
            ))}
            {cases.length === 0 ? <p>No matters yet. File one from the Matters desk.</p> : null}
          </ul>
        </div>
        <div className="panel rounded-2xl p-6">
          <h2 className="display text-2xl">Law in your locale</h2>
          <ul className="mt-4 space-y-3">
            {library.slice(0, 4).map((hit) => (
              <li key={hit.id}>
                <Link href={`/library/${hit.id}`} className="underline">
                  {hit.title}
                </Link>
                <p className="text-sm text-[#3d4a45]">{hit.citation}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
