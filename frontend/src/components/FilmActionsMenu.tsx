import { Menu, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = { onEdit: () => void; onDelete: () => void };

export default function FilmActionsMenu({ onEdit, onDelete }: Props) {
  // controlled so picking an action closes the menu before its dialog opens.
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Film actions"
          className="h-9 w-9 cursor-pointer border-white/10 bg-white/[0.03] dark:hover:bg-input/50"
        >
          <Menu size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-white/5"
        >
          <Pencil size={16} className="text-muted-foreground" />
          Edit film
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
          className="group mt-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={16} className="text-muted-foreground transition-colors group-hover:text-destructive" />
          Delete film
        </button>
      </PopoverContent>
    </Popover>
  );
}
