import { Star } from "lucide-react";
import { useState } from "react";

type Props = {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
};

export default function StarRatingInput({ value, onChange, disabled = false }: Props) {
  // hover state shows a preview of what the rating will become.
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    // mouseleave on the container is more reliable than per-star: sweeping
    // between stars triggers leave/enter events that can briefly stack and
    // cause the hovered value to drop to 0 between transitions.
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
            disabled={disabled}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            // no scale-on-hover: the previous design scaled the hovered star
            // to 110%, which moved its edge under the cursor and triggered
            // off/on hover loops. color change alone is enough feedback.
            className="cursor-pointer rounded-md p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star
              size={26}
              strokeWidth={0}
              fill="currentColor"
              className={
                filled
                  ? "text-[var(--gold)] transition-colors"
                  : "text-white/15 transition-colors"
              }
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm tabular-nums text-muted-foreground">{value}/5</span>
      )}
    </div>
  );
}
