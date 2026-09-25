export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-6 py-16" aria-busy="true">
      <p role="status" className="text-sm text-[#3d4a45]">Loading your LegalAid workspace...</p>
    </main>
  );
}
