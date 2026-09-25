"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-start justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-[#6e2c2c]">Something went wrong</p>
      <h1 className="display mt-3 text-4xl">We could not load this page.</h1>
      <p className="mt-3 max-w-xl text-[#3d4a45]">Your work is still protected. Try again, or return to your dashboard.</p>
      <button type="button" onClick={() => reset()} className="mt-6 rounded-full bg-[#14110b] px-5 py-3 text-[#f3ead7]">
        Try again
      </button>
    </main>
  );
}
