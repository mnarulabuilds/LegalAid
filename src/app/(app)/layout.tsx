import { requireSession } from "@/infrastructure/auth/session";
import { AppShell } from "@/ui/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession();
  return <AppShell user={user}>{children}</AppShell>;
}
