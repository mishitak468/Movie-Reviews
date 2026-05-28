import { ArrowDownWideNarrow, Clapperboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Movie } from "@/api";

export type SortKey = "featured" | "rating" | "reviews" | "newest" | "oldest" | "title";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Highest rated" },
  { value: "reviews", label: "Most reviewed" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title (A–Z)" },
] as const;

// sorting lives next to the filter ui since the two always move together.
export function sortMovies(list: Movie[], key: SortKey): Movie[] {
  const sorted = [...list];
  switch (key) {
    case "rating":
      // unrated films sink to the bottom instead of counting as a zero score.
      return sorted.sort((a, b) => (b.average_rating ?? -1) - (a.average_rating ?? -1));
    case "reviews":
      return sorted.sort((a, b) => b.review_count - a.review_count);
    case "newest":
      return sorted.sort((a, b) => b.release_year - a.release_year);
    case "oldest":
      return sorted.sort((a, b) => a.release_year - b.release_year);
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "featured":
      return list;
  }
}

type Props = {
  genres: string[];
  genre: string;
  sort: SortKey;
  onGenreChange: (genre: string) => void;
  onSortChange: (sort: SortKey) => void;
  onReset: () => void;
};

export default function CatalogFilters({ genres, genre, sort, onGenreChange, onSortChange, onReset }: Props) {
  const active = genre !== "all" || sort !== "featured";

  return (
    <div className="flex items-center gap-3">
      <Select value={genre} onValueChange={onGenreChange}>
        <SelectTrigger aria-label="Filter by genre" className="h-9 w-40 border-white/10 bg-white/[0.03]">
          <Clapperboard size={14} className="text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All genres</SelectItem>
          {genres.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
        <SelectTrigger aria-label="Sort films" className="h-9 w-44 border-white/10 bg-white/[0.03]">
          <ArrowDownWideNarrow size={14} className="text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {active && (
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="h-9 cursor-pointer text-muted-foreground hover:text-white"
        >
          <X size={16} className="mr-1.5" />
          Reset
        </Button>
      )}
    </div>
  );
}
