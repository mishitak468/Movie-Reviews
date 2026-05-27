import { Calendar, Film } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import RatingStars from "@/components/RatingStars";
import { Card } from "@/components/ui/card";
import { type Movie } from "@/api";

function genreHue(genre: string | null): number {
  if (!genre) return 220;
  let h = 0;
  for (const c of genre) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

type Props = { movie: Movie; index?: number; hideGenre?: boolean };

export default function MovieCard({ movie, index = 0, hideGenre = false }: Props) {
  const hue = genreHue(movie.genre);
  const [imgFailed, setImgFailed] = useState(false);
  const showPoster = movie.poster_url && !imgFailed;

  return (
    <article className="cine-rise" style={{ animationDelay: `${Math.min(index, 24) * 40}ms` }}>
      <Link
        to={`/movies/${movie.id}`}
        draggable={false}
        aria-label={`${movie.title} (${movie.release_year})`}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      >
        <Card
          className="group relative aspect-[2/3] cursor-pointer gap-0 overflow-hidden border-white/5 py-0 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:border-[var(--gold)] hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
          style={{
            background: `radial-gradient(120% 120% at 30% 15%, hsl(${hue} 18% 16%), hsl(${(hue + 20) % 360} 22% 5%))`,
          }}
        >
          {showPoster ? (
            <img
              src={movie.poster_url ?? undefined}
              alt=""
              draggable={false}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/15 transition-transform duration-700 group-hover:scale-110">
              <Film size={56} strokeWidth={1} />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/70 to-transparent" />

          {movie.genre && !hideGenre && (
            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-0">
              {movie.genre}
            </span>
          )}

          {/* flattened metadata stack — title / year / rating are direct siblings now
              so the gap between them is uniform (6px) instead of grouped 4/8 hierarchy. */}
          <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-4">
            <h3
              className="break-words text-base leading-tight text-white"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              {movie.title}
            </h3>
            <div className="flex items-center gap-1 text-[11px] tabular-nums text-white/45">
              <Calendar size={11} strokeWidth={2} />
              <span>{movie.release_year}</span>
            </div>
            <RatingStars rating={movie.average_rating} count={movie.review_count} />
          </div>
        </Card>
      </Link>
    </article>
  );
}
