import { Star, StarHalf } from "lucide-react";

type Props = { rating: number | null; count?: number; size?: number };

export default function RatingStars({ rating, count, size = 15 }: Props) {
  if (rating === null)
    return <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Unrated</span>;

  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-1.5" aria-label={`rated ${rating.toFixed(1)} out of 5`}>
      <div className="flex" style={{ color: "var(--gold)" }} aria-hidden>
        {Array.from({ length: 5 }, (_, i) => {
          if (i < full) return <Star key={i} size={size} strokeWidth={0} fill="currentColor" />;
          if (i === full && half) return <StarHalf key={i} size={size} strokeWidth={0} fill="currentColor" />;
          return <Star key={i} size={size} strokeWidth={0} fill="currentColor" className="text-white/15" />;
        })}
      </div>
      <span className="text-sm font-medium tabular-nums">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  );
}
