import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import WriteReviewForm from "@/components/WriteReviewForm";
import RatingStars from "@/components/RatingStars";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Review } from "@/api";

type Props = {
  review: Review;
  isOwner: boolean;
  onUpdate: (id: number, input: { rating: number; comment: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function ReviewCard({ review, isOwner, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(review.id);
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article
      id={`review-${review.id}`}
      className="group rounded-lg border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10"
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{review.username ?? `user #${review.user_id}`}</span>
            {isOwner && (
              <span className="rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--gold)]">
                You
              </span>
            )}
          </div>
          <time className="text-xs text-muted-foreground">{formatDate(review.created_at)}</time>
        </div>
        <RatingStars rating={review.rating} size={14} />
      </header>

      {review.comment && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">{review.comment}</p>
      )}

      {isOwner && !editing && (
        <footer className="mt-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="h-7 cursor-pointer text-xs text-muted-foreground hover:text-white"
          >
            <Pencil size={12} className="mr-1.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(true)}
            className="h-7 cursor-pointer text-xs text-muted-foreground hover:text-red-300"
          >
            <Trash2 size={12} className="mr-1.5" />
            Delete
          </Button>
        </footer>
      )}

      {editing && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <WriteReviewForm
            mode="edit"
            initialRating={review.rating}
            initialComment={review.comment ?? ""}
            onSubmit={async (input) => {
              await onUpdate(review.id, input);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      <Dialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this review?</DialogTitle>
            <DialogDescription>
              This permanently removes your rating and comment. It can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="cursor-pointer"
            >
              Keep it
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="cursor-pointer"
            >
              {deleting ? "Deleting…" : "Delete review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
