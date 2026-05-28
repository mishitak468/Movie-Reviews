import type { Api } from "./types";

// the mock holds module-level state — resetting modules between tests gives
// each test a clean slate. dynamic re-import after the reset so we read the
// freshly-loaded version.
let api: Api;

beforeEach(async () => {
  vi.resetModules();
  ({ mockApi: api } = await import("./mock"));
});

describe("mock api — movies", () => {
  it("seeds with at least one movie", async () => {
    const movies = await api.getMovies();
    expect(movies.length).toBeGreaterThan(0);
  });

  it("getMovie returns the movie with its reviews", async () => {
    const all = await api.getMovies();
    const detail = await api.getMovie(all[0].id);
    expect(detail.id).toBe(all[0].id);
    expect(Array.isArray(detail.reviews)).toBe(true);
  });

  it("getMovie 404s for an unknown id", async () => {
    await expect(api.getMovie(999999)).rejects.toMatchObject({ status: 404 });
  });

  it("createMovie appends to the list and exposes empty aggregates", async () => {
    const before = await api.getMovies();
    const created = await api.createMovie({
      title: "Test Film",
      release_year: 2020,
      genre: "Drama",
      poster_url: null,
    });
    const after = await api.getMovies();
    expect(after.length).toBe(before.length + 1);
    expect(created.average_rating).toBeNull();
    expect(created.review_count).toBe(0);
  });

  it("updateMovie modifies fields in place", async () => {
    const all = await api.getMovies();
    const target = all[0];
    const updated = await api.updateMovie(target.id, {
      title: "New Title",
      release_year: 1999,
      genre: target.genre ?? "Drama",
      poster_url: target.poster_url,
    });
    expect(updated.id).toBe(target.id);
    expect(updated.title).toBe("New Title");
    expect(updated.release_year).toBe(1999);
  });

  it("deleteMovie cascades and removes its reviews", async () => {
    const all = await api.getMovies();
    const withReviews = all.find((m) => m.review_count > 0);
    if (!withReviews) throw new Error("expected seed to contain a movie with reviews");

    const before = await api.getMovie(withReviews.id);
    const removedReviewIds = before.reviews.map((r) => r.id);
    expect(removedReviewIds.length).toBeGreaterThan(0);

    await api.deleteMovie(withReviews.id);
    await expect(api.getMovie(withReviews.id)).rejects.toMatchObject({ status: 404 });

    // verify reviews are gone by sweeping all users
    const users = await api.getUsers();
    const remaining = (await Promise.all(users.map((u) => api.getUserReviews(u.id)))).flat();
    for (const id of removedReviewIds) {
      expect(remaining.some((r) => r.id === id)).toBe(false);
    }
  });
});

describe("mock api — reviews", () => {
  it("createReview rejects a duplicate by the same user with 409", async () => {
    // create a movie so we have a fresh slate for the (user, movie) pair
    const movie = await api.createMovie({
      title: "Dedup Test",
      release_year: 2020,
      genre: "Drama",
      poster_url: null,
    });
    await api.createReview({
      user_id: 1,
      movie_id: movie.id,
      rating: 5,
      comment: "first review attempt",
    });
    await expect(
      api.createReview({
        user_id: 1,
        movie_id: movie.id,
        rating: 4,
        comment: "second review attempt",
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("createReview rejects out-of-range ratings with 400", async () => {
    const movie = await api.createMovie({
      title: "Rating Test",
      release_year: 2020,
      genre: "Drama",
      poster_url: null,
    });
    await expect(
      api.createReview({
        user_id: 1,
        movie_id: movie.id,
        rating: 7,
        comment: "bad rating attempt",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("average_rating aggregates the mean of attached reviews", async () => {
    const movie = await api.createMovie({
      title: "Aggregate Test",
      release_year: 2020,
      genre: "Drama",
      poster_url: null,
    });
    await api.createReview({ user_id: 1, movie_id: movie.id, rating: 5, comment: "first agg test" });
    await api.createReview({ user_id: 2, movie_id: movie.id, rating: 3, comment: "second agg test" });
    const detail = await api.getMovie(movie.id);
    expect(detail.average_rating).toBe(4);
    expect(detail.review_count).toBe(2);
  });

  it("getUserReviews scopes to a single user", async () => {
    const movie = await api.createMovie({
      title: "Scope Test",
      release_year: 2020,
      genre: "Drama",
      poster_url: null,
    });
    await api.createReview({ user_id: 1, movie_id: movie.id, rating: 5, comment: "scope test one" });
    const before = await api.getUserReviews(1);
    const u2 = await api.getUserReviews(2);
    expect(before.some((r) => r.movie_id === movie.id)).toBe(true);
    expect(u2.some((r) => r.movie_id === movie.id)).toBe(false);
  });
});

describe("mock api — top rated", () => {
  it("getTopRated sorts by average_rating descending", async () => {
    const top = await api.getTopRated();
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].average_rating ?? 0).toBeGreaterThanOrEqual(top[i].average_rating ?? 0);
    }
  });

  it("getTopRated excludes movies with no reviews", async () => {
    const fresh = await api.createMovie({
      title: "Unrated Film",
      release_year: 2020,
      genre: "Drama",
      poster_url: null,
    });
    const top = await api.getTopRated();
    expect(top.some((m) => m.id === fresh.id)).toBe(false);
  });
});
