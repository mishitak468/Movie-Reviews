import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactElement } from "react";
import CatalogFilters, { SORT_OPTIONS, sortMovies, type SortKey } from "@/components/CatalogFilters";
import CatalogMenu from "@/components/CatalogMenu";
import HeaderActions from "@/components/HeaderActions";
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import MovieForm from "@/components/MovieForm";
import MovieRow from "@/components/MovieRow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, type Movie } from "@/api";

const ROW_ITEM = "w-44 shrink-0 sm:w-52 md:w-56";

const INITIAL_ROWS = 4;
const ROWS_PER_BATCH = 3;
// number of placeholder rows shown during initial load. matches the "top
// rated + first few genres" shape so the loading state previews what's
// actually about to appear.
const SKELETON_ROW_COUNT = 4;
const SKELETON_CARDS_PER_ROW = 8;
const SKELETON_ROW_TITLES = ["Top Rated", "Drama", "Crime", "Sci-Fi"];

export default function Home(): ReactElement {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [visibleRowCount, setVisibleRowCount] = useState(INITIAL_ROWS);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // parallel — the two endpoints are independent server-side.
        const [allMovies, top] = await Promise.all([api.getMovies(), api.getTopRated()]);
        if (!active) return;
        setMovies(allMovies);
        setTopRated(top.slice(0, 12));
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
  // any of search / genre / sort being active leaves the row-browse view and
  // shows a flat sorted grid — same pattern search already used on its own.
  const narrowed = q !== "" || genre !== "all" || sort !== "featured";
  let result: Movie[] | null = null;
  if (narrowed) {
    result = genre === "all" ? movies : movies.filter((m) => m.genre === genre);
    if (q) result = result.filter((m) => m.title.toLowerCase().includes(q));
    result = sortMovies(result, sort);
  }
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label;

  const byGenre = new Map<string, Movie[]>();
  for (const m of movies) {
    if (!m.genre) continue;
    const list = byGenre.get(m.genre) ?? [];
    list.push(m);
    byGenre.set(m.genre, list);
  }
  const genres = [...byGenre.keys()].sort((a, b) => byGenre.get(b)!.length - byGenre.get(a)!.length);

  const totalRows = (topRated.length > 0 ? 1 : 0) + genres.length;

  useEffect(() => {
    if (status !== "ready" || narrowed) return;
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
  }, [status, narrowed, visibleRowCount, totalRows]);

  const genreRowsToShow = topRated.length > 0 ? Math.max(0, visibleRowCount - 1) : visibleRowCount;
  const allRowsVisible = visibleRowCount >= totalRows;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl font-medium tracking-tight sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
          Movie Reviews
        </h1>
        <HeaderActions>
          <CatalogMenu movies={movies} onAddFilm={() => setShowAddDialog(true)} />
        </HeaderActions>
      </header>

      <div className="mb-12 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search films…"
            aria-label="Search films"
            className="h-9 border-white/10 bg-white/[0.03] pl-9 pr-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <CatalogFilters
          genres={genres}
          genre={genre}
          sort={sort}
          onGenreChange={setGenre}
          onSortChange={setSort}
          onReset={() => {
            setGenre("all");
            setSort("featured");
          }}
        />
      </div>

      {status === "loading" && (
        <>
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIdx) => (
            <MovieRow key={`skeleton-${rowIdx}`} title={SKELETON_ROW_TITLES[rowIdx] ?? ""}>
              {Array.from({ length: SKELETON_CARDS_PER_ROW }, (_, cardIdx) => (
                <div key={cardIdx} className={ROW_ITEM}>
                  <MovieCardSkeleton />
                </div>
              ))}
            </MovieRow>
          ))}
        </>
      )}

      {status === "error" && (
        <p className="py-24 text-center text-muted-foreground">Couldn’t load films. Is the data source running?</p>
      )}

      {status === "ready" && result !== null && (
        <section>
          <p
            className="mb-6 text-xs uppercase tracking-[0.25em] text-muted-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {result.length} film{result.length === 1 ? "" : "s"}
            {q && <> · “{query.trim()}”</>}
            {genre !== "all" && <> · {genre}</>}
            {sort !== "featured" && <> · {sortLabel}</>}
          </p>
          {result.length === 0 ? (
            <p className="py-24 text-center text-muted-foreground">No films match those filters.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {result.map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          )}
        </section>
      )}

      {status === "ready" && result === null && (
        <>
          {topRated.length > 0 && (
            <MovieRow title="Top Rated">
              {topRated.map((m, i) => (
                <div key={m.id} className={ROW_ITEM}>
                  <MovieCard movie={m} index={i} />
                </div>
              ))}
            </MovieRow>
          )}
          {genres.slice(0, genreRowsToShow).map((g) => (
            <MovieRow key={g} title={g}>
              {byGenre.get(g)!.map((m, i) => (
                <div key={m.id} className={ROW_ITEM}>
                  <MovieCard movie={m} index={i} hideGenre />
                </div>
              ))}
            </MovieRow>
          ))}
          {!allRowsVisible && <div ref={sentinelRef} className="h-1" aria-hidden />}
        </>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a film</DialogTitle>
            <DialogDescription>
              The new film will appear in its genre row once you save.
            </DialogDescription>
          </DialogHeader>
          <MovieForm
            mode="create"
            extraGenres={genres}
            existingFilms={movies}
            onSubmit={async (input) => {
              const created = await api.createMovie(input);
              // prepend so the new film is the first thing visible at the top of its row.
              setMovies((prev) => [created, ...prev]);
              setShowAddDialog(false);
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
