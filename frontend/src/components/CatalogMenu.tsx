import { Menu, Plus } from "lucide-react";
import { useState } from "react";
import CatalogStats from "@/components/CatalogStats";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type Movie } from "@/api";

type Props = { movies: Movie[]; onAddFilm: () => void };

export default function CatalogMenu({ movies, onAddFilm }: Props) {
  // controlled so picking an action can close the menu before opening a dialog.
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Menu"
          className="h-9 w-9 cursor-pointer border-white/10 bg-white/[0.03] dark:hover:bg-input/50"
        >
          <Menu size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Catalog overview</p>
        <CatalogStats movies={movies} />
        <div className="-mx-4 my-4 h-px bg-border" />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onAddFilm();
          }}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-white/5"
        >
          <Plus size={16} className="text-muted-foreground" />
          Add film
        </button>
      </PopoverContent>
    </Popover>
  );
}
