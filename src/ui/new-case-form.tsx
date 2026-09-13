"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASE_CATEGORIES } from "@/domain/catalog";

export function NewCaseForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function action(formData: FormData) {
    setError("");
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        opposingParty: formData.get("opposingParty"),
        reliefSought: formData.get("reliefSought"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not file");
      return;
    }
    router.push(`/cases/${data.case.id}`);
    router.refresh();
  }

  return (
    <form action={action} className="panel rounded-2xl p-6 grid gap-3 md:grid-cols-2">
      <h2 className="display text-2xl md:col-span-2">File a new matter</h2>
      <label className="text-sm md:col-span-2">
        Title
        <input name="title" required className="mt-1 w-full rounded-md border border-[#14110b]/15 px-3 py-2" />
      </label>
      <label className="text-sm">
        Category
        <select name="category" className="mt-1 w-full rounded-md border border-[#14110b]/15 px-3 py-2">
          {CASE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Opposing party
        <input name="opposingParty" required className="mt-1 w-full rounded-md border border-[#14110b]/15 px-3 py-2" />
      </label>
      <label className="text-sm md:col-span-2">
        Facts
        <textarea name="description" required minLength={20} rows={3} className="mt-1 w-full rounded-md border border-[#14110b]/15 px-3 py-2" />
      </label>
      <label className="text-sm md:col-span-2">
        Relief sought
        <input name="reliefSought" required className="mt-1 w-full rounded-md border border-[#14110b]/15 px-3 py-2" />
      </label>
      {error ? <p className="text-sm text-[#6e2c2c] md:col-span-2">{error}</p> : null}
      <button className="rounded-full bg-[#14110b] px-5 py-2 text-[#f3ead7] md:col-span-2">Lodge with the registry</button>
    </form>
  );
}
