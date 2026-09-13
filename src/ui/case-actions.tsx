"use client";

import { useRouter } from "next/navigation";

type Lawyer = { userId: string; name: string; score: number; reasons: string[] };

export function CaseActions({ caseId, lawyers }: { caseId: string; lawyers: Lawyer[] }) {
  const router = useRouter();

  async function advance() {
    await fetch(`/api/cases/${caseId}/advance`, { method: "POST" });
    router.refresh();
  }

  async function assign(lawyerUserId: string) {
    await fetch(`/api/cases/${caseId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lawyerUserId }),
    });
    router.refresh();
  }

  async function openHearing() {
    const res = await fetch("/api/hearings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId }),
    });
    const data = await res.json();
    if (data.hearing?.id) router.push(`/hearings/${data.hearing.id}`);
  }

  return (
    <div className="panel rounded-2xl p-6 space-y-4">
      <div className="flex flex-wrap gap-3">
        <button onClick={advance} className="rounded-full bg-[#14110b] px-4 py-2 text-[#f3ead7]" type="button">
          Advance status
        </button>
        <button onClick={openHearing} className="rounded-full border border-[#14110b]/20 px-4 py-2" type="button">
          Open AI courtroom
        </button>
      </div>
      <div>
        <h3 className="text-sm uppercase tracking-widest text-[#b08d3e]">Recommended counsel</h3>
        <ul className="mt-2 space-y-2">
          {lawyers.map((lawyer) => (
            <li key={lawyer.userId} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                {lawyer.name} · score {lawyer.score}
                <span className="block text-xs text-[#3d4a45]">{lawyer.reasons.join(" · ")}</span>
              </span>
              <button type="button" className="underline" onClick={() => assign(lawyer.userId)}>
                Engage
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
