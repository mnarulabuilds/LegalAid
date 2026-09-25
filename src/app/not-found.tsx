import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-24">
      <p className="display text-5xl text-[#6e2c2c]">404</p>
      <p className="mt-4">That file is not on the rolls.</p>
      <Link href="/" className="mt-6 inline-block underline">
        Return to LegalAid
      </Link>
    </main>
  );
}
