// matches the real MovieDetail anatomy so the page doesn't jump on load:
// nav row, two-column hero (poster + metadata stack), and three review tiles.
export default function MovieDetailSkeleton() {
  return (
    <main className="relative min-h-screen">
      <div className="relative mx-auto max-w-6xl px-6 py-8">
        <nav className="mb-8 flex items-center justify-between gap-4">
          <div className="h-5 w-20 rounded cine-shimmer" />
          {/* mirrors HeaderActions' loading state so the two skeleton phases
              (page load -> user-list load) don't visibly change. */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-44 rounded cine-shimmer" />
            <div className="h-9 w-9 rounded cine-shimmer" />
          </div>
        </nav>

        <section className="mb-12 grid gap-8 md:grid-cols-[260px_1fr] md:gap-10">
          {/* poster placeholder */}
          <div className="aspect-[2/3] rounded-lg cine-shimmer" />

          {/* metadata stack — matches space-y-3 from the real layout */}
          <div className="flex flex-col justify-center space-y-3">
            <div className="h-12 w-3/4 rounded cine-shimmer" />
            <div className="flex gap-3">
              <div className="h-5 w-16 rounded cine-shimmer" />
              <div className="h-5 w-20 rounded cine-shimmer" />
              <div className="h-5 w-24 rounded cine-shimmer" />
            </div>
            <div className="h-6 w-32 rounded cine-shimmer" />
          </div>
        </section>

        <section className="space-y-6">
          <header className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-3">
            <div className="h-7 w-28 rounded cine-shimmer" />
            <div className="h-3 w-16 rounded cine-shimmer" />
          </header>

          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="h-4 w-24 rounded cine-shimmer" />
                  <div className="h-3 w-16 rounded cine-shimmer" />
                </div>
                <div className="h-4 w-20 rounded cine-shimmer" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded cine-shimmer" />
                <div className="h-3 w-11/12 rounded cine-shimmer" />
                <div className="h-3 w-3/4 rounded cine-shimmer" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
