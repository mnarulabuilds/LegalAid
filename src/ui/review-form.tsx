"use client";

import { useRouter } from "next/navigation";

export function ReviewForm({ lawyerId }: { lawyerId: string }) {
  const router = useRouter();
  async function action(formData: FormData) {
    await fetch(`/api/lawyers/${lawyerId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: Number(formData.get("rating")),
        comment: formData.get("comment"),
      }),
    });
    router.refresh();
  }
  return (
    <form action={action} className="panel rounded-2xl p-6 space-y-3">
      <h2 className="display text-2xl">Leave a record</h2>
      <select name="rating" className="rounded-md border border-[#14110b]/15 px-3 py-2">
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} stars
          </option>
        ))}
      </select>
      <textarea name="comment" required minLength={8} className="w-full rounded-md border border-[#14110b]/15 px-3 py-2" />
      <button className="rounded-full bg-[#14110b] px-4 py-2 text-[#f3ead7]">Submit</button>
    </form>
  );
}
