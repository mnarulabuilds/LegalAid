"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASE_CATEGORIES } from "@/domain/catalog";
import { SpeakButton } from "@/ui/audio";

type Item = { id: string; question: string; answer: string; category: string };

export function DoubtDesk({
  language,
  jurisdiction,
  history,
}: {
  language: string;
  jurisdiction: string;
  history: Item[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    await fetch("/api/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: formData.get("question"),
        category: formData.get("category"),
      }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">Doubt solving</p>
        <h1 className="display mt-2 text-4xl">Ask the library, then the bench</h1>
        <p className="mt-2 max-w-2xl text-[#3d4a45]">
          Answers are grounded in constitutions, amendments, and statutes for {jurisdiction}, in {language}. Not legal advice.
        </p>
      </header>
      <form action={action} className="panel rounded-2xl p-6 space-y-3">
        <select name="category" className="rounded-md border border-[#14110b]/15 px-3 py-2">
          {CASE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <textarea
          name="question"
          required
          minLength={8}
          rows={4}
          placeholder="What does equal protection mean for a private workplace dispute?"
          className="w-full rounded-md border border-[#14110b]/15 px-3 py-2"
        />
        <button disabled={pending} className="rounded-full bg-[#14110b] px-5 py-2 text-[#f3ead7]">
          {pending ? "Consulting sources…" : "Ask"}
        </button>
      </form>
      <ul className="space-y-4">
        {history.map((item) => (
          <li key={item.id} className="panel rounded-2xl p-5">
            <p className="font-medium">{item.question}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#b08d3e]">{item.category}</p>
            <div className="mt-3 flex justify-end">
              <SpeakButton text={item.answer} language={language} />
            </div>
            <p className="mt-2 whitespace-pre-wrap leading-7">{item.answer}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
