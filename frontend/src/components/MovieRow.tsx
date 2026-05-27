import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

type Props = { title: string; children: ReactNode };

export default function MovieRow({ title, children }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  // dragging triggers a class on the scroller that disables pointer events
  // on descendants — that's how we prevent a release-on-card from navigating
  // to that card. needs to be state so the className re-renders.
  const [isDragging, setIsDragging] = useState(false);

  // drag tracking via ref so handlers don't trigger renders every frame.
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [children]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    // skip if the user clicked the chevron buttons — they're inside the
    // relative parent but outside the scroller itself, so this shouldn't
    // matter, but defending against future restructure.
    if ((e.target as HTMLElement).closest("[data-row-control]")) return;
    e.preventDefault(); // prevent native image/text drag
    drag.current = { active: true, startX: e.pageX, startLeft: el.scrollLeft, moved: false };
    el.style.cursor = "grabbing";
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.pageX - drag.current.startX;
    // 5px threshold — small enough that any deliberate drag triggers it,
    // large enough that a slightly-shaky click isn't mistaken for a drag.
    if (Math.abs(dx) > 5 && !drag.current.moved) {
      drag.current.moved = true;
      setIsDragging(true); // adds pointer-events-none class to descendants
    }
    el.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = scrollerRef.current;
    if (el) el.style.cursor = "";

    if (drag.current.moved) {
      // keep pointer-events disabled for one tick so the synthetic click
      // event that follows mouseup is hit-tested against an inert element
      // and discarded by the browser. without this, the click bubbles to
      // the <Link> and react-router navigates to whatever card was under
      // the cursor at release time.
      setTimeout(() => {
        setIsDragging(false);
        drag.current.moved = false;
      }, 0);
    }
  };

  return (
    <section className="mb-14">
      <div className="mb-4">
        <h2 className="text-xl tracking-wide" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          {title}
        </h2>
        <span className="mt-1 block h-px w-8 bg-[var(--gold-soft)]" aria-hidden />
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          className={`no-scrollbar flex cursor-grab select-none snap-x snap-mandatory gap-4 overflow-x-auto pb-2 ${
            // the arbitrary selector targets all descendants so any link/button
            // inside the row becomes click-inert while dragging.
            isDragging ? "[&_*]:!pointer-events-none" : ""
          }`}
        >
          {children}
        </div>

        {canLeft && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--background)] to-transparent"
            aria-hidden
          />
        )}
        {canRight && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--background)] to-transparent"
            aria-hidden
          />
        )}

        {canLeft && (
          <button
            type="button"
            data-row-control
            onClick={() => scrollByPage(-1)}
            aria-label="Scroll left"
            className="absolute left-1 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/90"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {canRight && (
          <button
            type="button"
            data-row-control
            onClick={() => scrollByPage(1)}
            aria-label="Scroll right"
            className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/90"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
