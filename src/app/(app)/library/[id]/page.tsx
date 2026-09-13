import { requireSession } from "@/infrastructure/auth/session";
import { InstrumentReader } from "@/ui/instrument-reader";

export default async function InstrumentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  return <InstrumentReader id={id} language={user.language} />;
}
