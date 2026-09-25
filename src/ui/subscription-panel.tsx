"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Entitlements } from "@/domain/subscription/entitlements";
import type { SubscriptionPlan } from "@/domain/subscription/plans";

type BillingSummary = {
  plan: SubscriptionPlan;
  status: string;
  periodEnd: string | null;
  entitlements: Entitlements;
  billingConfigured: boolean;
};

export function SubscriptionPanel({ initial }: { initial: BillingSummary }) {
  const router = useRouter();
  const [summary] = useState(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upgrade() {
    setPending(true);
    setMessage(null);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    setPending(false);
    if (!res.ok) {
      setMessage(data.error ?? "Could not start checkout.");
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  async function manageBilling() {
    setPending(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    setPending(false);
    if (!res.ok) {
      setMessage(data.error ?? "Billing portal unavailable.");
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  const { entitlements } = summary;
  const isPro = summary.plan === "PRO";

  return (
    <section className="panel rounded-2xl p-6 space-y-4" aria-labelledby="billing-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="billing-heading" className="display text-2xl">
            Chambers subscription
          </h2>
          <p className="mt-1 text-sm text-[#3d4a45]">
            Current plan: <strong>{isPro ? "Pro" : "Free"}</strong> · Status {summary.status.replaceAll("_", " ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isPro ? (
            <button
              type="button"
              disabled={pending}
              onClick={upgrade}
              className="rounded-full bg-[#6e2c2c] px-4 py-2 text-[#f3ead7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14110b]"
            >
              {pending ? "Opening checkout…" : "Upgrade to Pro — $29/mo"}
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={manageBilling}
              className="rounded-full border border-[#14110b]/20 px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14110b]"
            >
              Manage billing
            </button>
          )}
        </div>
      </div>

      {message ? (
        <p className="text-sm text-[#6e2c2c]" role="status">
          {message}
        </p>
      ) : null}

      {!summary.billingConfigured ? (
        <p className="text-sm text-[#3d4a45]">
          Stripe is not configured — checkout uses development billing and activates Pro immediately for local testing.
        </p>
      ) : null}

      <dl className="grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <dt className="font-medium">Open matters</dt>
          <dd>
            {entitlements.usage.openCases}
            {entitlements.limits.maxOpenCases !== null ? ` / ${entitlements.limits.maxOpenCases}` : " (unlimited)"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">AI hearings this month</dt>
          <dd>
            {entitlements.usage.hearingsThisMonth}
            {entitlements.limits.maxHearingsPerMonth !== null
              ? ` / ${entitlements.limits.maxHearingsPerMonth}`
              : " (unlimited)"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Doubts this month</dt>
          <dd>
            {entitlements.usage.doubtsThisMonth}
            {entitlements.limits.maxDoubtsPerMonth !== null
              ? ` / ${entitlements.limits.maxDoubtsPerMonth}`
              : " (unlimited)"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Library explanations</dt>
          <dd>{isPro ? "Unlimited (Pro)" : "Pro feature"}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="text-sm underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14110b]"
        onClick={() => router.refresh()}
      >
        Refresh usage
      </button>
    </section>
  );
}
