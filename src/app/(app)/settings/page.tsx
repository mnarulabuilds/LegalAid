import { requireSession } from "@/infrastructure/auth/session";
import { LocaleForm } from "@/ui/locale-form";

export default async function SettingsPage() {
  const user = await requireSession();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">Locale</p>
        <h1 className="display mt-2 text-4xl">Where you live, and how the chamber speaks</h1>
        <p className="mt-2 max-w-2xl text-[#3d4a45]">
          Country selects the constitution and statutes we rank first. Language selects interface copy and speech synthesis / recognition.
        </p>
      </header>
      <LocaleForm user={user} />
    </div>
  );
}
