import { AlertCircle, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, type Movie, type MovieInput } from "@/api";

const CURRENT_YEAR = new Date().getFullYear();
// 1888 is roughly when the first surviving films were made.
const MIN_YEAR = 1888;
const MAX_YEAR = CURRENT_YEAR + 10;
const TITLE_MAX = 200;
const GENRE_MAX = 60;

// the controlled list. parents can pass extras (e.g. genres already present in
// the db) to widen the dropdown without sacrificing the picker's discipline.
const COMMON_GENRES = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
  "Musical", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller",
  "War", "Western",
];

// sentinel used as the Select value when the user wants to type a custom genre.
// real genre strings can never collide with this because it contains characters
// the input validation rejects.
const CUSTOM = "__custom__";

type InitialValues = {
  title: string;
  release_year: number;
  genre: string;
  poster_url: string | null;
};

type Props = {
  mode: "create" | "edit";
  initialValues?: InitialValues;
  // any genres already in the data — merged with COMMON_GENRES in the dropdown.
  extraGenres?: string[];
  // films already in the catalog — used to flag (title, year) duplicates as a warning.
  // omit to skip the check entirely (e.g. when the caller doesn't have the full list).
  existingFilms?: Movie[];
  onSubmit: (input: MovieInput) => Promise<void>;
  onCancel?: () => void;
};

// case + whitespace tolerant — "King Kong", "king kong", "King  Kong" all collapse.
function normalizeTitle(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function MovieForm({ mode, initialValues, extraGenres = [], existingFilms, onSubmit, onCancel }: Props) {
  // union + dedupe + sort, case-insensitive so "Drama" and "drama" collapse.
  const availableGenres = [...new Set([...COMMON_GENRES, ...extraGenres])]
    .filter((g) => g.trim().length > 0)
    .sort((a, b) => a.localeCompare(b));

  const initialGenre = initialValues?.genre ?? "";
  const initialGenreInList = availableGenres.some((g) => g.toLowerCase() === initialGenre.toLowerCase());

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [year, setYear] = useState(initialValues?.release_year != null ? String(initialValues.release_year) : "");
  // if the initial genre matches the list (case-insensitive), snap to the canonical casing.
  const canonicalInitial = availableGenres.find((g) => g.toLowerCase() === initialGenre.toLowerCase());
  const [selectedGenre, setSelectedGenre] = useState(
    initialGenreInList && canonicalInitial ? canonicalInitial : initialGenre ? CUSTOM : "",
  );
  const [customGenre, setCustomGenre] = useState(initialGenreInList ? "" : initialGenre);
  const [posterUrl, setPosterUrl] = useState(initialValues?.poster_url ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedCustom = customGenre.trim();
  const trimmedPoster = posterUrl.trim();
  const yearNum = Number(year);

  // resolved genre — what we'd actually send. snap to existing canonical casing
  // if the typed value matches one in the list, so "drama" → "Drama".
  const effectiveGenre = selectedGenre === CUSTOM
    ? availableGenres.find((g) => g.toLowerCase() === trimmedCustom.toLowerCase()) ?? trimmedCustom
    : selectedGenre;

  const hasTitle = trimmedTitle.length > 0;
  const hasGenre = effectiveGenre.trim().length > 0;
  const yearOk = Number.isInteger(yearNum) && yearNum >= MIN_YEAR && yearNum <= MAX_YEAR;
  const posterOk = trimmedPoster === "" || /^https?:\/\//i.test(trimmedPoster);

  const canSubmit = hasTitle && hasGenre && yearOk && posterOk && !submitting;

  // dedup is a warning, not a block. legitimate cases exist (sequels, remakes)
  // so we surface the collision and let the admin proceed.
  const duplicateMatch = (() => {
    if (!existingFilms || !hasTitle || !yearOk) return null;
    const editingSame = mode === "edit" && initialValues
      && normalizeTitle(initialValues.title) === normalizeTitle(trimmedTitle)
      && initialValues.release_year === yearNum;
    if (editingSame) return null;
    const normalized = normalizeTitle(trimmedTitle);
    return existingFilms.find(
      (f) => normalizeTitle(f.title) === normalized && f.release_year === yearNum,
    ) ?? null;
  })();

  const isDirty =
    mode === "create"
      ? hasTitle || hasGenre || year !== "" || trimmedPoster !== ""
      : title !== (initialValues?.title ?? "")
        || year !== (initialValues?.release_year != null ? String(initialValues.release_year) : "")
        || effectiveGenre !== initialGenre
        || posterUrl !== (initialValues?.poster_url ?? "");

  const handleCancel = () => {
    if (!onCancel) return;
    if (isDirty) setConfirmingDiscard(true);
    else onCancel();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasTitle) { setError("Title is required."); return; }
    if (!yearOk) { setError(`Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`); return; }
    if (!hasGenre) { setError("Pick a genre, or type one in the custom field."); return; }
    if (!posterOk) { setError("Poster URL must start with http:// or https://."); return; }

    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        release_year: yearNum,
        genre: effectiveGenre.trim(),
        poster_url: trimmedPoster || null,
      });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Something went wrong. Try again?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="movie-title" className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Title
          </label>
          <Input
            id="movie-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            disabled={submitting}
            autoFocus
            className="border-white/10 bg-white/[0.03]"
          />
          {duplicateMatch && (
            <p className="mt-1 flex items-start gap-1.5 text-[11px] text-amber-400">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              <span>
                “{duplicateMatch.title}” ({duplicateMatch.release_year}) is already in the catalog. Submit anyway if this is a different film.
              </span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-[1fr_140px] gap-4">
          <div>
            <label htmlFor="movie-genre" className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Genre
            </label>
            <Select
              value={selectedGenre}
              onValueChange={(v) => {
                setSelectedGenre(v);
                if (v !== CUSTOM) setCustomGenre("");
              }}
              disabled={submitting}
            >
              <SelectTrigger id="movie-genre" className="h-8 w-full border-white/10 bg-white/[0.03]">
                <SelectValue placeholder="Pick a genre…" />
              </SelectTrigger>
              <SelectContent>
                {availableGenres.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value={CUSTOM}>Other (type your own)…</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="movie-year" className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Year
            </label>
            <Input
              id="movie-year"
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              value={year}
              onChange={(e) => {
                const v = e.target.value;
                // digits only — blocks letters, decimals, minus, exponent, anything weird.
                if (v === "" || /^\d+$/.test(v)) setYear(v);
              }}
              disabled={submitting}
              className="border-white/10 bg-white/[0.03] tabular-nums"
            />
          </div>
        </div>

        {selectedGenre === CUSTOM && (
          <div>
            <label htmlFor="movie-genre-custom" className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Custom genre name
            </label>
            <Input
              id="movie-genre-custom"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              maxLength={GENRE_MAX}
              disabled={submitting}
              className="border-white/10 bg-white/[0.03]"
            />
            {trimmedCustom && effectiveGenre !== trimmedCustom && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Will save as “{effectiveGenre}” — matches an existing genre.
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="movie-poster" className="mb-2 flex items-baseline justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>Poster URL</span>
            <span className="text-[10px] normal-case tracking-normal text-muted-foreground/60">optional</span>
          </label>
          <Input
            id="movie-poster"
            type="url"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            disabled={submitting}
            className="border-white/10 bg-white/[0.03]"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/[0.04] p-3 text-sm text-red-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={submitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!canSubmit}
            className="cursor-pointer bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 size={14} className="mr-2 animate-spin" />}
            {mode === "create" ? "Add film" : "Save changes"}
          </Button>
        </div>
      </form>

      <Dialog open={confirmingDiscard} onOpenChange={setConfirmingDiscard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard your changes?</DialogTitle>
            <DialogDescription>
              You have unsaved edits. Closing this form will lose them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmingDiscard(false)}
              className="cursor-pointer"
            >
              Keep editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => { setConfirmingDiscard(false); onCancel?.(); }}
              className="cursor-pointer"
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
