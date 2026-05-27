import { useEffect, useState } from "react";
import { api } from "@/api";

// duplicated from useCurrentUser so this hook can read the active id without
// pulling in the full user-list fetch. keep these strings in sync with that file.
const USER_STORAGE_KEY = "movie-reviews:current-user-id";
const USER_CHANGE_EVENT = "movie-reviews:user-changed";

// fires after a review is created or deleted on the detail page; tells every
// mounted card to refresh its "reviewed" state without a hard reload.
const REVIEWS_CHANGED_EVENT = "movie-reviews:reviews-changed";

// module-level so 50 mounted cards trigger one fetch per user, not 50.
// keyed by user id so switching back to a previous user is instant.
const cache = new Map<number, Set<number>>();
const inflight = new Map<number, Promise<Set<number>>>();

function readCurrentUserId(): number | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

async function fetchIds(userId: number): Promise<Set<number>> {
  const hit = cache.get(userId);
  if (hit) return hit;
  const pending = inflight.get(userId);
  if (pending) return pending;
  const p = (async () => {
    try {
      const reviews = await api.getUserReviews(userId);
      const ids = new Set(reviews.map((r) => r.movie_id));
      cache.set(userId, ids);
      return ids;
    } finally {
      inflight.delete(userId);
    }
  })();
  inflight.set(userId, p);
  return p;
}

// call after the active user creates or deletes a review so every card
// re-checks its state. update is a no-op for set membership but harmless to bust.
export function notifyReviewsChanged(userId: number): void {
  cache.delete(userId);
  inflight.delete(userId);
  window.dispatchEvent(new CustomEvent(REVIEWS_CHANGED_EVENT, { detail: userId }));
}

export function useReviewedMovieIds(): Set<number> {
  const [userId, setUserId] = useState<number | null>(() => readCurrentUserId());
  const [ids, setIds] = useState<Set<number>>(() => {
    if (userId === null) return new Set<number>();
    return cache.get(userId) ?? new Set<number>();
  });

  // sync the active user id from picker writes (same tab + cross-tab).
  useEffect(() => {
    const onUserChange = (e: Event) => {
      const id = (e as CustomEvent<number>).detail;
      if (typeof id === "number") setUserId(id);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_STORAGE_KEY && e.newValue) setUserId(Number(e.newValue));
    };
    window.addEventListener(USER_CHANGE_EVENT, onUserChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(USER_CHANGE_EVENT, onUserChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // (re)load the set whenever the active user changes.
  useEffect(() => {
    if (userId === null) {
      setIds(new Set());
      return;
    }
    let active = true;
    (async () => {
      try {
        const next = await fetchIds(userId);
        if (active) setIds(next);
      } catch {
        if (active) setIds(new Set());
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  // react to review mutations from the detail page.
  useEffect(() => {
    const onReviewsChange = (e: Event) => {
      const id = (e as CustomEvent<number>).detail;
      if (typeof id !== "number" || id !== userId) return;
      (async () => {
        try {
          setIds(await fetchIds(id));
        } catch {
          setIds(new Set());
        }
      })();
    };
    window.addEventListener(REVIEWS_CHANGED_EVENT, onReviewsChange);
    return () => window.removeEventListener(REVIEWS_CHANGED_EVENT, onReviewsChange);
  }, [userId]);

  return ids;
}
