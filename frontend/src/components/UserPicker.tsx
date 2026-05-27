import { UserCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function UserPicker() {
  const { users, currentUser, setCurrentUserId, loading } = useCurrentUser();

  if (loading || users.length === 0) {
    // keep the layout stable so nothing jumps in once users load.
    return <div className="h-9 w-44" aria-hidden />;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <UserCircle2 size={16} className="text-muted-foreground" />
      <span className="hidden text-muted-foreground sm:inline">Reviewing as</span>
      <Select value={String(currentUser?.id ?? "")} onValueChange={(v) => setCurrentUserId(Number(v))}>
        <SelectTrigger className="h-9 w-44 border-white/10 bg-white/[0.03]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {users.map((u) => (
            <SelectItem key={u.id} value={String(u.id)}>
              {u.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
