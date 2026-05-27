import {
  ApiError,
  type Api,
  type Movie,
  type MovieDetail,
  type MovieInput,
  type Review,
  type ReviewInput,
  type ReviewUpdate,
  type User,
} from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  // backend error shape is { error: "..." } per the contract.
  if (!res.ok) throw new ApiError(res.status, body?.error ?? res.statusText);
  return body as T;
}

export const httpApi: Api = {
  getMovies: () => req<Movie[]>("/movies"),
  getMovie: (id) => req<MovieDetail>(`/movies/${id}`),
  getTopRated: () => req<Movie[]>("/movies/top-rated"),
  createMovie: (input) => req<Movie>("/movies", { method: "POST", body: JSON.stringify(input) }),
  updateMovie: (id, input) => req<Movie>(`/movies/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteMovie: (id) => req<void>(`/movies/${id}`, { method: "DELETE" }),

  getUsers: () => req<User[]>("/users"),
  getUserReviews: (userId) => req<Review[]>(`/users/${userId}/reviews`),

  createReview: (input) => req<Review>("/reviews", { method: "POST", body: JSON.stringify(input) }),
  updateReview: (id, input) => req<Review>(`/reviews/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteReview: (id) => req<void>(`/reviews/${id}`, { method: "DELETE" }),
};
