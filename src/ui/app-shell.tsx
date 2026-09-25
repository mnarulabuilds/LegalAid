"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/domain/policies/authorization";
import { t } from "@/infrastructure/i18n/dictionaries";

const links = [
  { href: "/dashboard", key: "dashboard" as const },
  { href: "/cases", key: "cases" as const },
  { href: "/lawyers", key: "lawyers" as const },
  { href: "/hearings", key: "hearings" as const },
  { href: "/library", key: "library" as const },
  { href: "/doubts", key: "doubts" as const },
  { href: "/settings", key: "settings" as const },
];

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const copy = t(user.language);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-[#14110b] text-[#f3ead7] px-6 py-8 flex flex-col gap-8">
        <div>
          <p className="display text-3xl text-[#b08d3e]">LegalAid</p>
          <p className="mt-2 text-sm text-[#f3ead7]/70">{copy.tagline}</p>
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-2 ${active ? "bg-[#b08d3e] text-[#14110b]" : "hover:bg-white/5"}`}
              >
                {copy[link.key]}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-[#f3ead7]/60">
            {user.role} · {user.countryCode} · {user.language}
          </p>
          <button className="mt-3 underline decoration-[#b08d3e]" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </aside>
      <div className="px-4 py-6 lg:px-10 lg:py-10">{children}</div>
    </div>
  );
}
