import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import RatingStars from "@/components/RatingStars";
import UserAvatar from "@/components/UserAvatar";
import WriteReviewForm from "@/components/WriteReviewForm";
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
    <article id={`review-${review.id}`} className="flex gap-3 py-5 first:pt-0 sm:gap-4">
      <UserAvatar username={review.username} userId={review.user_id} size={40} />

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium">{review.username ?? `user #${review.user_id}`}</span>
          {isOwner && (
            <span className="rounded-full bg-[var(--success)]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--success)]">
              You
            </span>
          )}
          <span className="text-xs text-muted-foreground" aria-hidden>·</span>
          <time className="text-xs text-muted-foreground">{formatDate(review.created_at)}</time>
          <div className="ml-auto">
            <RatingStars rating={review.rating} size={13} />
          </div>
        </header>

        {!editing && review.comment && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/85">{review.comment}</p>
        )}

        {isOwner && !editing && (
          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            >
              <Pencil size={12} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-red-300"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        )}

        {editing && (
          <div className="mt-3">
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
      </div>

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
