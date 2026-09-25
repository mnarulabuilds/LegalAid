"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { COUNTRIES, LANGUAGES } from "@/domain/catalog";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/dashboard";
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        countryCode: formData.get("countryCode"),
        language: formData.get("language"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not register");
      setPending(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <Link href="/" className="display text-3xl text-[#6e2c2c]">
        LegalAid
      </Link>
      <h1 className="display mt-8 text-4xl">Open an account</h1>
      <p className="mt-2 text-[#3d4a45]">Choose the country whose law should apply and the language for text and audio.</p>
      <form className="panel mt-8 space-y-4 rounded-2xl p-6" action={onSubmit}>
        <label className="block text-sm">
          Full name
          <input name="name" required className="mt-1 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2" />
        </label>
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" minLength={8} required className="mt-1 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2" />
        </label>
        <label className="block text-sm">
          Country / jurisdiction
          <select name="countryCode" defaultValue="IN" className="mt-1 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2">
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Application language (text & audio)
          <select name="language" defaultValue="en" className="mt-1 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2">
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        {error ? <p role="alert" className="text-sm text-[#6e2c2c]">{error}</p> : null}
        <button disabled={pending} aria-busy={pending} className="w-full rounded-full bg-[#14110b] py-3 text-[#f3ead7]">
          {pending ? "Opening…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already admitted? <Link href="/login" className="underline">Sign in</Link>
      </p>
    </main>
  );
}
