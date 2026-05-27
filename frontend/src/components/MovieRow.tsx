import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

type Props = { title: string; children: ReactNode };

export default function MovieRow({ title, children }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [hovered, setHovered] = useState(false);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  // when true, ignore scroll-driven updates so our optimistic flip survives the in-flight smooth scroll.
  const suppressUpdate = useRef(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      if (suppressUpdate.current) return;
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
    const distance = dir * el.clientWidth * 0.85;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const next = Math.max(0, Math.min(maxScroll, el.scrollLeft + distance));

    // optimistic update + suppress the live scroll handler so the in-flight scroll
    // doesn't keep re-setting canLeft/canRight back to "true" until the scroll completes.
    setCanLeft(next > 4);
    setCanRight(next < maxScroll - 4);
    suppressUpdate.current = true;

    const release = () => {
      suppressUpdate.current = false;
    };
    // modern browsers fire scrollend when a smooth scroll completes; older ones won't, so we also
    // fall back to a timeout that comfortably covers a smooth scroll's typical duration.
    el.addEventListener("scrollend", release, { once: true });
    window.setTimeout(release, 700);

    el.scrollBy({ left: distance, behavior: "smooth" });
  };

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    e.preventDefault();
    drag.current = { active: true, startX: e.pageX, startLeft: el.scrollLeft, moved: false };
    el.style.cursor = "grabbing";
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.pageX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = scrollerRef.current;
    if (el) el.style.cursor = "";
  };

  const onClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const arrowBase =
    "absolute top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition-opacity duration-500 hover:bg-black/90";

  return (
    <section className="mb-14">
      <div className="mb-4">
        <h2 className="text-xl tracking-wide" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          {title}
        </h2>
        <span className="mt-1 block h-px w-8 bg-[var(--gold-soft)]" aria-hidden />
      </div>

      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          endDrag();
        }}
      >
        <div
          ref={scrollerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onClickCapture={onClickCapture}
          className="no-scrollbar flex cursor-grab select-none gap-4 overflow-x-auto px-1 py-3"
        >
          {children}
        </div>

        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--background)] to-transparent transition-opacity duration-500 ${
            canLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--background)] to-transparent transition-opacity duration-500 ${
            canRight ? "opacity-100" : "opacity-0"
          }`}
        />

        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll left"
          className={`${arrowBase} left-1 ${
            hovered && canLeft ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll right"
          className={`${arrowBase} right-1 ${
            hovered && canRight ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
