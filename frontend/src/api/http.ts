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

  if (!res.ok) {
    // flask sends {success:false, errors:[...]}; the global 404/500 handlers send {error:"..."}
    const messages: string[] = Array.isArray(body?.errors)
      ? body.errors
      : [body?.error ?? res.statusText];
    throw new ApiError(res.status, messages.join("; "), messages);
  }

  // success payloads are wrapped: {success:true, data:<the resource>}
  return body.data as T;
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
