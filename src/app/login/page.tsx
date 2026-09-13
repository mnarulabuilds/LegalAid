"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/dashboard";
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not sign in");
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
      <h1 className="display mt-8 text-4xl">Sign in</h1>
      <form className="panel mt-8 space-y-4 rounded-2xl p-6" action={onSubmit}>
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" required className="mt-1 w-full rounded-md border border-[#14110b]/15 bg-white px-3 py-2" />
        </label>
        {error ? <p className="text-sm text-[#6e2c2c]">{error}</p> : null}
        <button disabled={pending} className="w-full rounded-full bg-[#14110b] py-3 text-[#f3ead7]">
          {pending ? "Checking roll…" : "Enter chambers"}
        </button>
      </form>
      <p className="mt-4 text-sm text-[#3d4a45]">
        Demo: citizen@legalaid.test / LegalAid123 · priya.rao@legalaid.test / LegalAid123
      </p>
      <p className="mt-2 text-sm">
        New here? <Link href="/register" className="underline">Create an account</Link>
      </p>
    </main>
  );
}
