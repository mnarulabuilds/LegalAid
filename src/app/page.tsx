import Link from "next/link";
import { COUNTRIES } from "@/domain/catalog";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="flex items-center justify-between">
        <p className="display text-3xl text-[#6e2c2c]">LegalAid</p>
        <div className="flex gap-3 text-sm">
          <Link href="/login" className="rounded-full border border-[#14110b]/20 px-4 py-2">
            Sign in
          </Link>
          <Link href="/register" className="rounded-full bg-[#14110b] px-4 py-2 text-[#f3ead7]">
            Open chambers
          </Link>
        </div>
      </header>

      <section className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">A forum beside the forum</p>
          <h1 className="display mt-4 text-5xl leading-tight md:text-6xl">
            Disputes, counsel, and the written law — in the country and language you live in.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[#3d4a45]">
            LegalAid does not retire judges. It helps you file a matter, understand constitutions and amendments,
            rehearse arguments before an AI bench, and retain a human lawyer with a public record of outcomes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-full bg-[#6e2c2c] px-5 py-3 text-[#f3ead7]">
              File a matter
            </Link>
            <Link href="/login?next=/library" className="rounded-full border border-[#14110b]/20 px-5 py-3">
              Search laws & constitutions
            </Link>
          </div>
        </div>
        <div className="panel rounded-2xl p-6">
          <p className="text-sm uppercase tracking-widest text-[#b08d3e]">Jurisdictions in chambers</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {COUNTRIES.map((c) => (
              <li key={c.code} className="rounded-lg bg-[#f3ead7]/60 px-3 py-3">
                <span className="font-medium">{c.name}</span>
                <span className="mt-1 block text-xs text-[#3d4a45]">{c.legalSystem}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          ["01", "The library", "Constitutions, amendments, statutes and leading cases, ranked for your country and audio/text language."],
          ["02", "The courtroom", "An AI judge hears both sides, asks for evidence, and issues an advisory ruling you can take to a human forum."],
          ["03", "The bar", "Verified lawyers with win/settlement stats, recommended by specialty, jurisdiction, and language."],
        ].map(([n, title, body]) => (
          <article key={n} className="panel rounded-2xl p-6">
            <p className="text-[#b08d3e]">{n}</p>
            <h2 className="display mt-2 text-2xl">{title}</h2>
            <p className="mt-3 text-[#3d4a45]">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
