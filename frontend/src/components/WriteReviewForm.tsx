import { AlertCircle, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import StarRatingInput from "@/components/StarRatingInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/api";

const MIN_COMMENT_LENGTH = 20;
const MAX_COMMENT_LENGTH = 2000;
// thresholds for the counter's color shift — feels feedback before it bites.
const COUNTER_AMBER_AT = 1800;
const COUNTER_RED_AT = 1950;

type Props = {
  mode: "create" | "edit";
  initialRating?: number;
  initialComment?: string;
  onSubmit: (input: { rating: number; comment: string }) => Promise<void>;
  onCancel?: () => void;
};

export default function WriteReviewForm({
  mode,
  initialRating = 0,
  initialComment = "",
  onSubmit,
  onCancel,
}: Props) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  // dirty check uses raw comment (not trimmed) so adding-then-removing whitespace
  // doesn't falsely report "no changes."
  const isDirty = rating !== initialRating || comment !== initialComment;

  // validation derived once, used by both the button and the counter.
  // we measure the trimmed length because pure whitespace shouldn't count.
  const trimmedLength = comment.trim().length;
  const hasRating = rating >= 1;
  const meetsMinimum = trimmedLength >= MIN_COMMENT_LENGTH;
  const canSubmit = hasRating && meetsMinimum && !submitting;

  // counter text + color depend on which phase we're in.
  const charactersRemaining = MAX_COMMENT_LENGTH - comment.length;
  const counterColor =
    comment.length >= COUNTER_RED_AT
      ? "text-red-400"
      : comment.length >= COUNTER_AMBER_AT
        ? "text-amber-400"
        : "text-muted-foreground";

  const counterText = !meetsMinimum
    ? `${MIN_COMMENT_LENGTH - trimmedLength} more character${MIN_COMMENT_LENGTH - trimmedLength === 1 ? "" : "s"} needed`
    : `${comment.length} / ${MAX_COMMENT_LENGTH}`;

  const handleCancel = () => {
    if (!onCancel) return;
    if (isDirty) {
      setConfirmingDiscard(true);
    } else {
      onCancel();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // defensive: the button is disabled in this state, but a determined user
    // can re-enable it via devtools. validate again here so the api never
    // sees garbage.
    if (!hasRating) {
      setError("Please pick a rating.");
      return;
    }
    if (!meetsMinimum) {
      setError(`Reviews should be at least ${MIN_COMMENT_LENGTH} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ rating, comment: comment.trim() });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Try again?");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Your rating
          </label>
          <StarRatingInput value={rating} onChange={setRating} disabled={submitting} />
        </div>

        <div>
          <label htmlFor="review-comment" className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Your review
          </label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Share your thoughts (at least ${MIN_COMMENT_LENGTH} characters)…`}
            rows={5}
            maxLength={MAX_COMMENT_LENGTH}
            disabled={submitting}
            aria-describedby="review-comment-counter"
            className="resize-none border-white/10 bg-white/[0.03]"
          />
          <div
            id="review-comment-counter"
            className={`mt-1 text-right text-[11px] tabular-nums ${counterColor}`}
            aria-live="polite"
          >
            {counterText}
            {meetsMinimum && charactersRemaining <= 50 && (
              <span className="ml-1.5 text-muted-foreground">
                ({charactersRemaining} left)
              </span>
            )}
          </div>
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
            {mode === "create" ? "Post review" : "Save changes"}
          </Button>
        </div>
      </form>

      <Dialog open={confirmingDiscard} onOpenChange={setConfirmingDiscard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard your changes?</DialogTitle>
            <DialogDescription>
              You have unsaved edits to your review. Closing this form will lose them.
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
              onClick={() => {
                setConfirmingDiscard(false);
                onCancel?.();
              }}
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
