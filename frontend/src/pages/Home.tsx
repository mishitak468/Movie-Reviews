import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactElement } from "react";
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import MovieRow from "@/components/MovieRow";
import { Input } from "@/components/ui/input";
import { api, type Movie } from "@/api";

// fixed per-card width inside a row so the carousel doesn't shrink cards on overflow.
const ROW_ITEM = "w-44 shrink-0 sm:w-52 md:w-56";

const INITIAL_ROWS = 4;
const ROWS_PER_BATCH = 3;

export default function Home(): ReactElement {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [query, setQuery] = useState("");
  const [visibleRowCount, setVisibleRowCount] = useState(INITIAL_ROWS);
  const searchRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getMovies();
        if (!active) return;
        setMovies(data);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // "/" focuses the search box anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q ? movies.filter((m) => m.title.toLowerCase().includes(q)) : null;

  // top-rated row: highest averages first, capped so the row isn't huge.
  const topRated = [...movies]
    .filter((m) => m.average_rating !== null)
    .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
    .slice(0, 12);

  // group by genre; sort genres by movie count so denser categories lead.
  const byGenre = new Map<string, Movie[]>();
  for (const m of movies) {
    if (!m.genre) continue;
    const list = byGenre.get(m.genre) ?? [];
    list.push(m);
    byGenre.set(m.genre, list);
  }
  const genres = [...byGenre.keys()].sort((a, b) => byGenre.get(b)!.length - byGenre.get(a)!.length);

  // total rows = top rated (if any) + genre rows
  const totalRows = (topRated.length > 0 ? 1 : 0) + genres.length;

  // progressive row reveal via intersection observer on a sentinel below the visible rows.
  useEffect(() => {
    if (status !== "ready" || filtered !== null) return;
    if (visibleRowCount >= totalRows) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleRowCount((n) => Math.min(n + ROWS_PER_BATCH, totalRows));
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [status, filtered, visibleRowCount, totalRows]);

  // figure out how many genre rows to render: subtract 1 for the top rated row if present.
  const genreRowsToShow = topRated.length > 0 ? Math.max(0, visibleRowCount - 1) : visibleRowCount;
  const allRowsVisible = visibleRowCount >= totalRows;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-12">
        <h1 className="text-5xl font-medium tracking-tight sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
          Movie Reviews
        </h1>
      </header>

      <div className="mb-12">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search films…"
            aria-label="Search films"
            className="border-white/10 bg-white/[0.03] pl-9 pr-16"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground">
              /
            </kbd>
          )}
        </div>
      </div>

      {status === "loading" && (
        <MovieRow title="Loading">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={ROW_ITEM}>
              <MovieCardSkeleton />
            </div>
          ))}
        </MovieRow>
      )}

      {status === "error" && (
        <p className="py-24 text-center text-muted-foreground">Couldn’t load films. Is the data source running?</p>
      )}

      {status === "ready" && filtered !== null && (
        <section>
          <p className="mb-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {filtered.length} result{filtered.length === 1 ? "" : "s"} for “{query.trim()}”
          </p>
          {filtered.length === 0 ? (
            <p className="py-24 text-center text-muted-foreground">No films match that search.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          )}
        </section>
      )}

      {status === "ready" && filtered === null && (
        <>
          {topRated.length > 0 && (
            <MovieRow title="Top Rated">
              {topRated.map((m, i) => (
                <div key={m.id} className={ROW_ITEM}>
                  {/* top rated mixes genres, so the badge stays useful here */}
                  <MovieCard movie={m} index={i} />
                </div>
              ))}
            </MovieRow>
          )}
          {genres.slice(0, genreRowsToShow).map((g) => (
            <MovieRow key={g} title={g}>
              {byGenre.get(g)!.map((m, i) => (
                <div key={m.id} className={ROW_ITEM}>
                  {/* genre is implied by the row title — hide the redundant badge */}
                  <MovieCard movie={m} index={i} hideGenre />
                </div>
              ))}
            </MovieRow>
          ))}
          {!allRowsVisible && <div ref={sentinelRef} className="h-1" aria-hidden />}
        </>
      )}
    </main>
  );
}
