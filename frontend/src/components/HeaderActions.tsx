import { type ReactNode } from "react";
import UserPicker from "@/components/UserPicker";
import { useCurrentUser } from "@/lib/userContext";

type Props = { children: ReactNode };

// keeps the "reviewing as" picker and the page's menu button in lockstep: both
// wait on the user list, then cascade in together. previously the menu button
// rendered instantly while the picker waited on its own fetch, so it always
// popped in a beat early. cine-rise stagger matches MovieCard's reveal.
export default function HeaderActions({ children }: Props) {
  const { users, currentUser, setCurrentUserId, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-44 rounded cine-shimmer" />
        <div className="h-9 w-9 rounded cine-shimmer" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="cine-rise">
        <UserPicker users={users} currentUser={currentUser} onChange={setCurrentUserId} />
      </div>
      <div className="cine-rise" style={{ animationDelay: "90ms" }}>
        {children}
      </div>
    </div>
  );
}
