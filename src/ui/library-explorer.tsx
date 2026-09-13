"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { COUNTRIES, INSTRUMENT_KINDS, INSTRUMENT_KIND_LABELS, LANGUAGES } from "@/domain/catalog";
import { SpeakButton } from "@/ui/audio";
import { t } from "@/infrastructure/i18n/dictionaries";

type Hit = {
  id: string;
  kind: string;
  title: string;
  citation: string;
  articleRef: string | null;
  summary: string;
  snippet?: string;
  jurisdiction: string;
  locale: string;
  enactedYear: number | null;
  score?: number;
  matchedOn?: string[];
};

export function LibraryExplorer({
  defaultJurisdiction,
  defaultLocale,
}: {
  defaultJurisdiction: string;
  defaultLocale: string;
}) {
  const copy = t(defaultLocale);
  const [q, setQ] = useState("");
  const [jurisdiction, setJurisdiction] = useState(defaultJurisdiction);
  const [locale, setLocale] = useState(defaultLocale);
  const [kind, setKind] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(true);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    else p.set("mode", "browse");
    p.set("jurisdiction", jurisdiction);
    p.set("locale", locale);
    if (kind) p.set("kind", kind);
    return p.toString();
  }, [q, jurisdiction, locale, kind]);

  useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/library?${queryString}`);
      const data = await res.json();
      setHits((data.results ?? data.instruments ?? []) as Hit[]);
      setLoading(false);
    }, 250);
    return () => clearTimeout(handle);
  }, [queryString]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">{copy.library}</p>
          <h1 className="display mt-2 text-4xl">Constitutions, amendments, and the living statute book</h1>
          <p className="mt-2 max-w-2xl text-[#3d4a45]">
            Results prefer your country and the language of the text. International instruments appear when they
            illuminate a domestic question. {copy.disclaimer}
          </p>
        </div>
      </header>

      <div className="panel rounded-2xl p-5 grid gap-4 md:grid-cols-4">
        <label className="text-sm md:col-span-2">
          {copy.searchLaws}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="mt-1 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2"
          />
        </label>
        <label className="text-sm">
          {copy.country}
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {copy.language}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <div className="md:col-span-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setKind("")}
            className={`rounded-full px-3 py-1 text-sm ${kind === "" ? "bg-[#14110b] text-[#f3ead7]" : "border border-[#14110b]/15"}`}
          >
            All layers
          </button>
          {INSTRUMENT_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1 text-sm ${kind === k ? "bg-[#14110b] text-[#f3ead7]" : "border border-[#14110b]/15"}`}
            >
              {INSTRUMENT_KIND_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-sm text-[#3d4a45]">Consulting the rolls…</p> : null}

      <ul className="space-y-4">
        {hits.map((hit) => (
          <li key={hit.id} className="panel rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-widest text-[#b08d3e]">
                {hit.kind.replaceAll("_", " ")} · {hit.jurisdiction} · {hit.locale}
                {hit.enactedYear ? ` · ${hit.enactedYear}` : ""}
              </p>
              <SpeakButton text={`${hit.title}. ${hit.summary}`} language={locale} />
            </div>
            <Link href={`/library/${hit.id}`} className="display mt-2 block text-2xl hover:text-[#6e2c2c]">
              {hit.title}
            </Link>
            <p className="text-sm text-[#3d4a45]">{hit.citation}</p>
            <p className="mt-3">{hit.snippet || hit.summary}</p>
            {hit.matchedOn?.length ? (
              <p className="mt-2 text-xs uppercase tracking-wide text-[#3d4a45]">
                Matched on {hit.matchedOn.join(", ")}
                {typeof hit.score === "number" ? ` · score ${hit.score}` : ""}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {!loading && hits.length === 0 ? (
        <p className="panel rounded-2xl p-6">No instruments matched. Try another country, language, or a broader term such as “constitution” or “equality”.</p>
      ) : null}
    </div>
  );
}
