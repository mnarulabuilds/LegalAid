import Link from "next/link";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";
import { NewCaseForm } from "@/ui/new-case-form";

export default async function CasesPage() {
  const user = await requireSession();
  const cases = await services.cases.list(user);
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">Matters</p>
        <h1 className="display mt-2 text-4xl">The cause list</h1>
      </header>
      <NewCaseForm />
      <ul className="space-y-3">
        {cases.map((matter) => (
          <li key={matter.id} className="panel rounded-2xl p-5">
            <Link href={`/cases/${matter.id}`} className="display text-2xl hover:text-[#6e2c2c]">
              {matter.title}
            </Link>
            <p className="mt-1 text-sm text-[#3d4a45]">
              {matter.status.replaceAll("_", " ")} · {matter.category} · {matter.jurisdiction} · v. {matter.opposingParty}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
