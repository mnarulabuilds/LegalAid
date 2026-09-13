"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SpeakButton } from "@/ui/audio";

type Instrument = {
  id: string;
  kind: string;
  title: string;
  citation: string;
  articleRef: string | null;
  summary: string;
  body: string;
  topics: string;
  jurisdiction: string;
  locale: string;
  enactedYear: number | null;
  source: string;
  parent: { id: string; title: string } | null;
  children: { id: string; title: string; kind: string }[];
};

export function InstrumentReader({ id, language }: { id: string; language: string }) {
  const [item, setItem] = useState<Instrument | null>(null);
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch(`/api/library/${id}`)
      .then((r) => r.json())
      .then((d) => setItem(d.instrument));
  }, [id]);

  async function explain() {
    setPending(true);
    const res = await fetch(`/api/library/${id}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setExplanation(data.explanation ?? data.error);
    setPending(false);
  }

  if (!item) return <p>Loading the instrument…</p>;

  return (
    <article className="space-y-6">
      <Link href="/library" className="text-sm underline">
        Back to the library
      </Link>
      <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">
        {item.kind.replaceAll("_", " ")} · {item.jurisdiction} · {item.locale}
      </p>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="display text-4xl">{item.title}</h1>
        <SpeakButton text={`${item.title}. ${item.summary}. ${item.body}`} language={language} />
      </div>
      <p className="text-[#3d4a45]">
        {item.citation}
        {item.articleRef ? ` · ${item.articleRef}` : ""}
        {item.enactedYear ? ` · ${item.enactedYear}` : ""}
      </p>
      {item.parent ? (
        <p className="text-sm">
          Amends / sits under{" "}
          <Link className="underline" href={`/library/${item.parent.id}`}>
            {item.parent.title}
          </Link>
        </p>
      ) : null}

      <section className="panel rounded-2xl p-6">
        <h2 className="display text-2xl">In plain terms</h2>
        <p className="mt-3 leading-7">{item.summary}</p>
      </section>
      <section className="panel rounded-2xl p-6">
        <h2 className="display text-2xl">Operative text (educational abridgement)</h2>
        <p className="mt-3 leading-8 whitespace-pre-wrap">{item.body}</p>
        <p className="mt-4 text-xs text-[#3d4a45]">Source: {item.source}. Confirm the in-force official text before filing.</p>
      </section>

      {item.children.length > 0 ? (
        <section>
          <h2 className="display text-2xl">Amendments & related provisions</h2>
          <ul className="mt-3 space-y-2">
            {item.children.map((child) => (
              <li key={child.id}>
                <Link className="underline" href={`/library/${child.id}`}>
                  {child.title}
                </Link>
                <span className="text-sm text-[#3d4a45]"> · {child.kind}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="panel rounded-2xl p-6">
        <h2 className="display text-2xl">Ask this provision</h2>
        <p className="mt-2 text-sm text-[#3d4a45]">
          The answer uses your application language and this instrument’s jurisdiction.
        </p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Does this protect me against a private employer?"
          className="mt-3 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2"
          rows={3}
        />
        <button
          type="button"
          onClick={explain}
          disabled={pending}
          className="mt-3 rounded-full bg-[#14110b] px-5 py-2 text-[#f3ead7]"
        >
          {pending ? "Reading…" : "Explain in plain language"}
        </button>
        {explanation ? (
          <div className="mt-4">
            <SpeakButton text={explanation} language={language} />
            <p className="mt-2 whitespace-pre-wrap leading-7">{explanation}</p>
          </div>
        ) : null}
      </section>
    </article>
  );
}
