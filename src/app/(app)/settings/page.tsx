import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { LocaleForm } from "@/ui/locale-form";
import { SubscriptionPanel } from "@/ui/subscription-panel";

export default async function SettingsPage() {
  const user = await requireSession();
  const billing = await services.subscription.getBillingSummary(user.id);
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">Account</p>
        <h1 className="display mt-2 text-4xl">Settings & subscription</h1>
        <p className="mt-2 max-w-2xl text-[#3d4a45]">
          Country selects the constitution and statutes we rank first. Language selects interface copy and speech
          synthesis. Upgrade to Pro for unlimited matters, AI rehearsal, and prep exports.
        </p>
      </header>
      <SubscriptionPanel
        initial={{
          plan: billing.plan,
          status: billing.status,
          periodEnd: billing.periodEnd?.toISOString() ?? null,
          entitlements: billing.entitlements,
          billingConfigured: billing.billingConfigured,
        }}
      />
      <section aria-labelledby="locale-heading">
        <h2 id="locale-heading" className="display text-2xl">
          Locale
        </h2>
        <LocaleForm user={user} />
      </section>
    </div>
  );
}
