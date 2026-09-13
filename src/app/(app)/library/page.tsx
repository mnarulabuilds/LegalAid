import { requireSession } from "@/infrastructure/auth/session";
import { LibraryExplorer } from "@/ui/library-explorer";
import { t } from "@/infrastructure/i18n/dictionaries";

export default async function LibraryPage() {
  const user = await requireSession();
  const copy = t(user.language);
  return (
    <div>
      <p className="sr-only">{copy.library}</p>
      <LibraryExplorer defaultJurisdiction={user.countryCode} defaultLocale={user.language} />
    </div>
  );
}
