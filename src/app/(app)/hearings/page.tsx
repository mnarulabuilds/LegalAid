import Link from "next/link";
import { requireSession } from "@/infrastructure/auth/session";
import { services } from "@/infrastructure/container";

export default async function HearingsPage() {
  const user = await requireSession();
  const hearings = await services.hearings.list(user);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d3e]">AI courtroom</p>
        <h1 className="display mt-2 text-4xl">Sessions in progress</h1>
        <p className="mt-2 max-w-2xl text-[#3d4a45]">
          The bench listens to argument, asks for proof, and may issue an advisory ruling. It does not bind a court of record.
        </p>
      </header>
      <ul className="space-y-3">
        {hearings.map((hearing) => (
          <li key={hearing.id} className="panel rounded-2xl p-5">
            <Link href={`/hearings/${hearing.id}`} className="display text-2xl">
              {hearing.title}
            </Link>
            <p className="text-sm text-[#3d4a45]">
              {hearing.status.replaceAll("_", " ")} · {hearing.case.title}
            </p>
          </li>
        ))}
        {hearings.length === 0 ? <p>Open a hearing from a matter on the cause list.</p> : null}
      </ul>
    </div>
  );
}
