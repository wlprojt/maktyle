export default function DesignsLoading() {
  return (
    <main className="min-h-screen bg-[#faf9fc]">
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-4 w-36 rounded bg-slate-200" />

        <div className="mt-5 h-10 w-64 rounded bg-slate-200" />

        <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" />

        <div className="mt-8 h-44 rounded-3xl bg-white" />

        <div className="mt-6 h-20 rounded-3xl bg-white" />

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl bg-white"
            >
              <div className="aspect-[4/5] bg-slate-100" />

              <div className="space-y-3 p-5">
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="h-5 w-full rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-11 w-full rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}