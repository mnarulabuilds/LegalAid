"use client";

import { LANGUAGES } from "@/domain/catalog";

export function speak(text: string, language: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const meta = LANGUAGES.find((l) => l.code === language);
  utterance.lang = meta?.speech ?? "en-US";
  window.speechSynthesis.speak(utterance);
}

export function SpeakButton({ text, language }: { text: string; language: string }) {
  return (
    <button
      type="button"
      className="rounded-full border border-[#14110b]/15 px-3 py-1 text-xs tracking-wide uppercase"
      onClick={() => speak(text, language)}
    >
      Listen
    </button>
  );
}
