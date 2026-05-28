import { act, renderHook, waitFor } from "@testing-library/react";
import type { Api } from "@/api";

// reset modules so the hook's module-level cache is fresh between tests, and
// the mock starts from the seeded state.
let useReviewedMovieIds: typeof import("./useReviewedMovieIds").useReviewedMovieIds;
let notifyReviewsChanged: typeof import("./useReviewedMovieIds").notifyReviewsChanged;
let api: Api;

beforeEach(async () => {
  vi.resetModules();
  localStorage.clear();
  ({ api } = await import("@/api"));
  ({ useReviewedMovieIds, notifyReviewsChanged } = await import("./useReviewedMovieIds"));
});

describe("useReviewedMovieIds", () => {
  it("returns an empty set when no user is selected", () => {
    const { result } = renderHook(() => useReviewedMovieIds());
    expect(result.current.size).toBe(0);
  });

  it("populates with the user's reviewed movie ids after fetch", async () => {
    const reviews = await api.getUserReviews(1);
    if (reviews.length === 0) throw new Error("expected seed to give user 1 some reviews");

    localStorage.setItem("movie-reviews:current-user-id", "1");
    const { result } = renderHook(() => useReviewedMovieIds());

    await waitFor(() => {
      expect(result.current.has(reviews[0].movie_id)).toBe(true);
    });
  });

  it("refetches when the user-changed event fires", async () => {
    const u2Reviews = await api.getUserReviews(2);
    if (u2Reviews.length === 0) throw new Error("expected seed to give user 2 some reviews");

    localStorage.setItem("movie-reviews:current-user-id", "1");
    const { result } = renderHook(() => useReviewedMovieIds());
    await waitFor(() => expect(result.current.size).toBeGreaterThan(0));

    act(() => {
      localStorage.setItem("movie-reviews:current-user-id", "2");
      window.dispatchEvent(new CustomEvent("movie-reviews:user-changed", { detail: 2 }));
    });

    await waitFor(() => {
      expect(result.current.has(u2Reviews[0].movie_id)).toBe(true);
    });
  });

  it("notifyReviewsChanged busts the cache and triggers a refetch", async () => {
    localStorage.setItem("movie-reviews:current-user-id", "1");
    const { result } = renderHook(() => useReviewedMovieIds());
    await waitFor(() => expect(result.current.size).toBeGreaterThan(0));
    const before = result.current;

    act(() => {
      notifyReviewsChanged(1);
    });

    // even if contents match, the Set reference changes after refetch
    await waitFor(() => {
      expect(result.current).not.toBe(before);
    });
  });
});
