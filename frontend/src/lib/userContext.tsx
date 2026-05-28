import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type User } from "@/api";

const STORAGE_KEY = "movie-reviews:current-user-id";
// same-tab custom event so useReviewedMovieIds (which reads the id on its own)
// hears picker changes. the native 'storage' event only fires across tabs.
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
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: id }));
  } catch {
    // ignore quota / sandbox errors
  }
}

type Ctx = {
  users: User[];
  currentUser: User | null;
  setCurrentUserId: (id: number) => void;
  loading: boolean;
};

const UserContext = createContext<Ctx | null>(null);

// single source of "who am I reviewing as": one fetch, one loading state,
// shared by the header picker and the detail page. previously every consumer
// ran its own getUsers() with its own loading, so the header lagged the page
// content it should have appeared alongside.
export function UserProvider({ children }: { children: ReactNode }) {
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
    // fetch the list once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cross-tab sync: another tab's picker write updates this one. same-tab
  // updates flow through the shared context directly, so no listener needed.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setCurrentUserIdState(Number(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setCurrentUserId = (id: number) => {
    setCurrentUserIdState(id);
    writeStoredId(id);
  };

  const currentUser = users.find((u) => u.id === currentUserId) ?? null;

  return (
    <UserContext.Provider value={{ users, currentUser, setCurrentUserId, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser(): Ctx {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within UserProvider");
  return ctx;
}
