import { ArrowLeft, Calendar, Check, Film, MessageSquare, Tag } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MovieDetailSkeleton from "@/components/MovieDetailSkeleton";
import RatingStars from "@/components/RatingStars";
import ReviewCard from "@/components/ReviewCard";
import UserPicker from "@/components/UserPicker";
import WriteReviewForm from "@/components/WriteReviewForm";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { notifyReviewsChanged } from "@/lib/useReviewedMovieIds";
import { ApiError, api, type MovieDetail as MovieDetailT } from "@/api";

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const movieId = id ? Number(id) : NaN;
  const { currentUser } = useCurrentUser();

  const [movie, setMovie] = useState<MovieDetailT | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "not-found" | "ready">("loading");
  const [imgFailed, setImgFailed] = useState(false);

  const load = useCallback(async () => {
    if (Number.isNaN(movieId)) {
      setStatus("not-found");
      return;
    }
    try {
      const data = await api.getMovie(movieId);
      setMovie(data);
      setStatus("ready");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setStatus("not-found");
      else setStatus("error");
    }
  }, [movieId]);

  useEffect(() => {
    setStatus("loading");
    setImgFailed(false);
    load();
  }, [load]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [movieId]);

  const ownReview = movie && currentUser
    ? movie.reviews.find((r) => r.user_id === currentUser.id) ?? null
    : null;

  const handleCreate = async (input: { rating: number; comment: string }) => {
    if (!currentUser || !movie) throw new ApiError(400, "No user selected");
    await api.createReview({
      user_id: currentUser.id,
      movie_id: movie.id,
      rating: input.rating,
      comment: input.comment,
    });
    await load();
    notifyReviewsChanged(currentUser.id);
  };

  const handleUpdate = async (reviewId: number, input: { rating: number; comment: string }) => {
    await api.updateReview(reviewId, input);
    await load();
  };

  const handleDelete = async (reviewId: number) => {
    await api.deleteReview(reviewId);
    await load();
    if (currentUser) notifyReviewsChanged(currentUser.id);
  };

  if (status === "loading") {
    return <MovieDetailSkeleton />;
  }
  if (status === "error") {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="py-24 text-center text-muted-foreground">
          Couldn’t load this film. <Link to="/" className="underline">Back to home</Link>
        </p>
      </main>
    );
  }
  if (status === "not-found" || !movie) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="py-24 text-center text-muted-foreground">
          That film doesn’t exist. <Link to="/" className="underline">Back to home</Link>
        </p>
      </main>
    );
  }

  const showPoster = movie.poster_url && !imgFailed;

  return (
    <main className="relative min-h-screen">
      {showPoster && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] overflow-hidden"
          aria-hidden
        >
          <img
            src={movie.poster_url ?? undefined}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-25 blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/70 to-[var(--background)]" />
        </div>
      )}

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        <nav className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            All films
          </Link>
          <UserPicker />
        </nav>

        <section className="mb-12 grid gap-8 md:grid-cols-[260px_1fr] md:gap-10">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
            {showPoster ? (
              <img
                src={movie.poster_url ?? undefined}
                alt={`Poster for ${movie.title}`}
                onError={() => setImgFailed(true)}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/15">
                <Film size={64} strokeWidth={1} />
              </div>
            )}
          </div>

          {/* unified metadata stack: title -> facts -> rating, each as a direct sibling.
              space-y-3 makes the gap visually consistent against the title's line-height. */}
          <div className="flex flex-col justify-center space-y-3">
            <h1
              className="text-4xl leading-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {movie.release_year}
              </span>
              {movie.genre && (
                <span className="flex items-center gap-1.5">
                  <Tag size={14} />
                  {movie.genre}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MessageSquare size={14} />
                {movie.review_count} {movie.review_count === 1 ? "review" : "reviews"}
              </span>
              {ownReview && (
                <span className="flex items-center gap-1.5 text-[var(--success)]">
                  <Check size={14} strokeWidth={2.5} />
                  Reviewed
                </span>
              )}
            </div>

            <RatingStars rating={movie.average_rating} size={20} />
          </div>
        </section>

        <section className="space-y-6">
          <header className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-3">
            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              Reviews
            </h2>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {movie.reviews.length} total
            </span>
          </header>

          {currentUser && !ownReview && (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-sm font-medium">Write a review</h3>
              <WriteReviewForm mode="create" onSubmit={handleCreate} />
            </div>
          )}

          {movie.reviews.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No reviews yet. Be the first.
            </p>
          )}

          {movie.reviews.length > 0 && (
            <div className="divide-y divide-white/5">
              {[...movie.reviews]
                .sort((a, b) => {
                  if (currentUser) {
                    if (a.user_id === currentUser.id) return -1;
                    if (b.user_id === currentUser.id) return 1;
                  }
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
                .map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isOwner={currentUser?.id === review.user_id}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
