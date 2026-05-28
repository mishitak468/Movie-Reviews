import seed from "./seed.json";
import {
  ApiError,
  type Api,
  type Movie,
  type MovieDetail,
  type Review,
  type User,
} from "./types";

// mutable in-memory copies so create/update/delete persist within a session.
const users: User[] = structuredClone(seed.users);
let movies: Omit<Movie, "average_rating" | "review_count">[] = structuredClone(
  seed.movies.map(({ average_rating, review_count, ...m }) => m),
);
let reviews: Review[] = structuredClone(seed.reviews);

// 350ms feels like a slow-ish real network request without becoming annoying.
// adjust here if you want the dev experience snappier (try 150) or want to
// stress-test the loading state (try 800). production hits the real backend.
const wait = () => new Promise((r) => setTimeout(r, 350));
const nextId = (rows: { id: number }[]) => Math.max(0, ...rows.map((r) => r.id)) + 1;

function withAggregates(m: (typeof movies)[number]): Movie {
  const rs = reviews.filter((r) => r.movie_id === m.id);
  const avg = rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : null;
  return { ...m, average_rating: avg === null ? null : Math.round(avg * 10) / 10, review_count: rs.length };
}

const uname = (id: number) => users.find((u) => u.id === id)?.username;
const mtitle = (id: number) => movies.find((m) => m.id === id)?.title;
const decorate = (r: Review): Review => ({ ...r, username: uname(r.user_id), movie_title: mtitle(r.movie_id) });

export const mockApi: Api = {
  async getMovies() {
    await wait();
    return movies.map(withAggregates);
  },
  async getMovie(id) {
    await wait();
    const m = movies.find((x) => x.id === id);
    if (!m) throw new ApiError(404, "Movie not found");
    const detail: MovieDetail = { ...withAggregates(m), reviews: reviews.filter((r) => r.movie_id === id).map(decorate) };
    return detail;
  },
  async getTopRated() {
    await wait();
    return movies
      .map(withAggregates)
      .filter((m) => m.average_rating !== null)
      .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
  },
  async createMovie(input) {
    await wait();
    const m = { id: nextId(movies), ...input, poster_url: null, created_at: new Date().toISOString() };
    movies = [...movies, m];
    return withAggregates(m);
  },
  async updateMovie(id, input) {
    await wait();
    const m = movies.find((x) => x.id === id);
    if (!m) throw new ApiError(404, "Movie not found");
    Object.assign(m, input);
    return withAggregates(m);
  },
  async deleteMovie(id) {
    await wait();
    if (!movies.some((m) => m.id === id)) throw new ApiError(404, "Movie not found");
    movies = movies.filter((m) => m.id !== id);
    reviews = reviews.filter((r) => r.movie_id !== id);
  },

  async getUsers() {
    await wait();
    return users;
  },
  async getUserReviews(userId) {
    await wait();
    if (!users.some((u) => u.id === userId)) throw new ApiError(404, "User not found");
    return reviews.filter((r) => r.user_id === userId).map(decorate);
  },

  async createReview(input) {
    await wait();
    if (input.rating < 1 || input.rating > 5) throw new ApiError(400, "rating must be between 1 and 5");
    if (!movies.some((m) => m.id === input.movie_id)) throw new ApiError(404, "Movie not found");
    if (!users.some((u) => u.id === input.user_id)) throw new ApiError(404, "User not found");
    if (reviews.some((r) => r.user_id === input.user_id && r.movie_id === input.movie_id))
      throw new ApiError(409, "User has already reviewed this movie");
    const r: Review = { id: nextId(reviews), ...input, created_at: new Date().toISOString() };
    reviews = [...reviews, r];
    return decorate(r);
  },
  async updateReview(id, input) {
    await wait();
    const r = reviews.find((x) => x.id === id);
    if (!r) throw new ApiError(404, "Review not found");
    if (input.rating < 1 || input.rating > 5) throw new ApiError(400, "rating must be between 1 and 5");
    Object.assign(r, input);
    return decorate(r);
  },
  async deleteReview(id) {
    await wait();
    if (!reviews.some((r) => r.id === id)) throw new ApiError(404, "Review not found");
    reviews = reviews.filter((r) => r.id !== id);
  },
};
