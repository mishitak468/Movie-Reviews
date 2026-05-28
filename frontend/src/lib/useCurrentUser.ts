import { useEffect, useState } from "react";
import { api, type User } from "@/api";

const STORAGE_KEY = "movie-reviews:current-user-id";
// custom event name so different hook instances in the same tab can react to
// each other's writes. the native 'storage' event only fires across tabs.
const CHANGE_EVENT = "movie-reviews:user-changed";

function readStoredId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredId(id: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(id));
    // notify other instances of this hook in the same tab.
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: id }));
  } catch {
    // ignore quota / sandbox errors
  }
}

// shared "who am I reviewing as" state. used by the picker in the header
// and by detail pages to decide which reviews show edit/delete affordances.
// persisted to localStorage so the choice survives reloads, and synced
// across hook instances so changing the picker updates the page live.
export function useCurrentUser(): {
  users: User[];
  currentUser: User | null;
  setCurrentUserId: (id: number) => void;
  loading: boolean;
} {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserIdState] = useState<number | null>(readStoredId());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getUsers();
        if (!active) return;
        setUsers(data);
        if (currentUserId === null && data.length > 0) {
          setCurrentUserIdState(data[0].id);
          writeStoredId(data[0].id);
        }
      } catch {
        // mock always succeeds; the real backend may be down.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // we only fetch the list once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // listen for picker changes from any other instance of this hook.
  useEffect(() => {
    const onChange = (e: Event) => {
      const id = (e as CustomEvent<number>).detail;
      if (typeof id === "number") setCurrentUserIdState(id);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setCurrentUserIdState(Number(e.newValue));
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage); // across-tab sync (free).
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setCurrentUserId = (id: number) => {
    setCurrentUserIdState(id);
    writeStoredId(id);
  };

  const currentUser = users.find((u) => u.id === currentUserId) ?? null;

  return { users, currentUser, setCurrentUserId, loading };
}
