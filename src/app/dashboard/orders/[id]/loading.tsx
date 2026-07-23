export default function OrderDetailsLoading() {
  return (
    <main className="min-h-screen bg-[#faf9fc]">
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-5 h-10 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" />

        <div className="mt-8 h-48 rounded-3xl bg-white" />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="h-96 rounded-3xl bg-white" />
            <div className="h-80 rounded-3xl bg-white" />
          </div>

          <div className="space-y-6">
            <div className="h-72 rounded-3xl bg-white" />
            <div className="h-64 rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    </main>
  );
}