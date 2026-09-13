"use client";

import { useRouter } from "next/navigation";
import { COUNTRIES, LANGUAGES } from "@/domain/catalog";
import type { SessionUser } from "@/domain/policies/authorization";

export function LocaleForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  async function action(formData: FormData) {
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode: formData.get("countryCode"),
        language: formData.get("language"),
        name: formData.get("name"),
      }),
    });
    router.refresh();
  }
  return (
    <form action={action} className="panel max-w-lg space-y-4 rounded-2xl p-6">
      <label className="block text-sm">
        Name
        <input name="name" defaultValue={user.name} className="mt-1 w-full rounded-md border border-[#14110b]/15 px-3 py-2" />
      </label>
      <label className="block text-sm">
        Country / jurisdiction (law that should be searched first)
        <select
          name="countryCode"
          defaultValue={user.countryCode}
          className="mt-1 w-full rounded-md border border-[#14110b]/15 px-3 py-2"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Application language for text and audio
        <select
          name="language"
          defaultValue={user.language}
          className="mt-1 w-full rounded-md border border-[#14110b]/15 px-3 py-2"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
      <button className="rounded-full bg-[#14110b] px-5 py-2 text-[#f3ead7]">Save locale</button>
    </form>
  );
}
