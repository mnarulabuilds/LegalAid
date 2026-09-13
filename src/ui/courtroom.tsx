"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpeakButton } from "@/ui/audio";
import { LANGUAGES } from "@/domain/catalog";

type Message = {
  id: string;
  speakerType: string;
  speakerName: string;
  content: string;
};

export function Courtroom({
  hearingId,
  title,
  status,
  language,
  caseTitle,
  messages,
  ruling,
}: {
  hearingId: string;
  title: string;
  status: string;
  language: string;
  caseTitle: string;
  messages: Message[];
  ruling: string | null;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  async function speak() {
    if (draft.trim().length < 8) return;
    setPending(true);
    await fetch(`/api/hearings/${hearingId}/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft }),
    });
    setDraft("");
    setPending(false);
    router.refresh();
  }

  async function conclude() {
    setPending(true);
    await fetch(`/api/hearings/${hearingId}/conclude`, { method: "POST" });
    setPending(false);
    router.refresh();
  }

  function listenMic() {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => {
        lang: string;
        start: () => void;
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      };
      SpeechRecognition?: new () => {
        lang: string;
        start: () => void;
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      };
    };
    const SR = w.webkitSpeechRecognition ?? w.SpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    const meta = LANGUAGES.find((l) => l.code === language);
    rec.lang = meta?.speech ?? "en-US";
    rec.onresult = (event) => {
      const said = event.results[0]?.[0]?.transcript ?? "";
      setDraft((prev) => `${prev} ${said}`.trim());
    };
    rec.start();
  }

  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">
        {status.replaceAll("_", " ")} · {caseTitle}
      </p>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="display text-4xl">{title}</h1>
        <button
          type="button"
          disabled={pending || status === "CONCLUDED"}
          onClick={conclude}
          className="rounded-full border border-[#14110b]/20 px-4 py-2 text-sm"
        >
          Ask for advisory ruling
        </button>
      </div>

      <ol className="space-y-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl p-4 ${m.speakerType === "JUDGE" ? "bg-[#14110b] text-[#f3ead7]" : "panel"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-widest">
                {m.speakerName} · {m.speakerType}
              </p>
              <SpeakButton text={m.content} language={language} />
            </div>
            <p className="mt-2 whitespace-pre-wrap leading-7">{m.content}</p>
          </li>
        ))}
      </ol>

      {ruling ? (
        <section className="panel rounded-2xl p-6">
          <h2 className="display text-2xl">Advisory ruling on file</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7">{ruling}</p>
        </section>
      ) : null}

      {status !== "CONCLUDED" ? (
        <div className="panel rounded-2xl p-4 space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Address the bench. State facts, the rule, and the order you seek."
            rows={4}
            className="w-full rounded-md border border-[#14110b]/15 px-3 py-2"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={speak}
              disabled={pending}
              className="rounded-full bg-[#14110b] px-4 py-2 text-[#f3ead7]"
            >
              {pending ? "The bench is considering…" : "Submit argument"}
            </button>
            <button type="button" onClick={listenMic} className="rounded-full border border-[#14110b]/20 px-4 py-2">
              Speak (microphone)
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
