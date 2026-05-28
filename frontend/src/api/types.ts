// wire shapes use snake_case to match the db columns + flask json — no mapping layer.

export type User = {
  id: number;
  username: string;
  email: string;
  created_at: string;
};

export type Movie = {
  id: number;
  title: string;
  release_year: number;
  genre: string | null;
  poster_url: string | null; // tmdb cdn url, nullable when no poster has been resolved.
  created_at: string;
  // computed server-side. present on list + detail; null when no reviews.
  average_rating: number | null;
  review_count: number;
};

export type Review = {
  id: number;
  user_id: number;
  movie_id: number;
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
  // joined for display in lists — backend should include these.
  username?: string;
  movie_title?: string;
};

export type MovieDetail = Movie & { reviews: Review[] };

export type MovieInput = { title: string; release_year: number; genre: string; poster_url?: string | null };
export type ReviewInput = { user_id: number; movie_id: number; rating: number; comment: string };
export type ReviewUpdate = { rating: number; comment: string };

// both the http and mock adapters conform to this, so swapping one for the
// other can never drift the shapes.
export type Api = {
  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<MovieDetail>;
  getTopRated(): Promise<Movie[]>;
  createMovie(input: MovieInput): Promise<Movie>;
  updateMovie(id: number, input: MovieInput): Promise<Movie>;
  deleteMovie(id: number): Promise<void>;

  getUsers(): Promise<User[]>; // not in the backend's list yet — see README
  getUserReviews(userId: number): Promise<Review[]>;

  createReview(input: ReviewInput): Promise<Review>; // throws ApiError 409 on duplicate
  updateReview(id: number, input: ReviewUpdate): Promise<Review>;
  deleteReview(id: number): Promise<void>;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
