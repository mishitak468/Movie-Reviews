import { Clapperboard, Film, MessageSquare, Star } from "lucide-react";
import { type Movie } from "@/api";

type Props = { movies: Movie[] };

export default function CatalogStats({ movies }: Props) {
  const reviews = movies.reduce((sum, m) => sum + m.review_count, 0);
  // weight each movie's average by its review count so heavily-reviewed films
  // count for more — the catalog-wide mean of ratings, not the flat mean of
  // per-movie averages (which would over-weight films with one review).
  const avg =
    reviews > 0
      ? movies.reduce((sum, m) => sum + (m.average_rating ?? 0) * m.review_count, 0) / reviews
      : null;

  const byGenre = new Map<string, number>();
  for (const m of movies) if (m.genre) byGenre.set(m.genre, (byGenre.get(m.genre) ?? 0) + 1);
  const topGenre = [...byGenre.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const tiles = [
    { icon: Film, label: "Films", value: String(movies.length), gold: false },
    { icon: MessageSquare, label: "Reviews", value: String(reviews), gold: false },
    { icon: Star, label: "Avg rating", value: avg === null ? "—" : avg.toFixed(1), gold: true },
    { icon: Clapperboard, label: "Top genre", value: topGenre, gold: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
      {tiles.map(({ icon: Icon, label, value, gold }) => (
        <div key={label}>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon size={13} strokeWidth={2} />
            <span className="text-[11px] uppercase tracking-[0.2em]">{label}</span>
          </div>
          <p
            className={`mt-1.5 truncate text-2xl tabular-nums ${gold ? "text-[var(--gold)]" : "text-white"}`}
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
