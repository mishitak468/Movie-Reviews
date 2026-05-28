import { UserCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type User } from "@/api";

// controlled by HeaderActions, which reads the shared user context and owns
// the loading/skeleton gate so the picker and the menu button stay in sync.
type Props = {
  users: User[];
  currentUser: User | null;
  onChange: (id: number) => void;
};

export default function UserPicker({ users, currentUser, onChange }: Props) {
  if (users.length === 0) return null;

  return (
    <Select value={String(currentUser?.id ?? "")} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger aria-label="Reviewing as" className="h-9 w-44 border-white/10 bg-white/[0.03]">
        <UserCircle2 size={14} className="text-muted-foreground" />
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
  );
}
