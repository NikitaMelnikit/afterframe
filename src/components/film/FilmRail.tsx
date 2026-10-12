import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MovieSummary } from '@/data/types';
import { cn } from '@/lib/cn';
import { FilmCard, FilmCardSkeleton } from './FilmCard';

type Size = 'sm' | 'md' | 'lg';
const WIDTH: Record<Size, string> = {
  sm: 'w-[38vw] sm:w-[26vw] md:w-[17vw] lg:w-[12.5vw] 2xl:w-[200px]',
  md: 'w-[46vw] sm:w-[32vw] md:w-[22vw] lg:w-[16vw] 2xl:w-[250px]',
  lg: 'w-[58vw] sm:w-[40vw] md:w-[28vw] lg:w-[21vw] 2xl:w-[330px]',
};
/** Deliberate rhythm of poster scales rather than a uniform strip. */
const RHYTHM: Size[] = ['lg', 'md', 'sm', 'md', 'lg', 'sm', 'md', 'md', 'lg', 'sm', 'md', 'sm'];

interface FilmRailProps {
  films: MovieSummary[] | undefined;
  label: string;
  loading?: boolean;
  /** Uniform sizes for denser rails (e.g. similar films). */
  uniform?: boolean;
  descriptors?: Record<number, string>;
  showRuntime?: boolean;
}

export function FilmRail({ films, label, loading, uniform, descriptors, showRuntime }: FilmRailProps) {
  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, films]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  };

  const items = films ?? [];

  return (
    <div className="relative" role="region" aria-label={label}>
      <ul
        ref={scroller}
        onScroll={update}
        className="no-scrollbar rail-mask flex snap-x snap-mandatory items-start gap-4 overflow-x-auto overscroll-x-contain scroll-px-gutter px-gutter pb-2 md:gap-6"
      >
        {loading && !items.length
          ? Array.from({ length: 7 }, (_, i) => (
              <li key={i} className={cn('shrink-0 snap-start', WIDTH[uniform ? 'md' : RHYTHM[i % RHYTHM.length]])}>
                <FilmCardSkeleton />
              </li>
            ))
          : items.map((film, i) => {
              const size = uniform ? 'md' : RHYTHM[i % RHYTHM.length];
              return (
                <li key={film.id} className={cn('shrink-0 snap-start', WIDTH[size], !uniform && size === 'sm' && 'md:mt-16', !uniform && size === 'md' && i % 2 === 1 && 'md:mt-8')}>
                  <FilmCard
                    film={film}
                    descriptor={descriptors?.[film.id]}
                    showRuntime={showRuntime}
                    sizes={size === 'lg' ? '(min-width:1024px) 22vw, 58vw' : '(min-width:1024px) 16vw, 46vw'}
                  />
                </li>
              );
            })}
      </ul>
      {items.length > 3 && (
        <div className="pointer-events-none absolute -top-16 right-gutter hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={edges.start}
            aria-label={`Scroll ${label} backwards`}
            className="pointer-events-auto grid h-11 w-11 place-items-center border border-line-strong text-ivory transition-colors hover:border-ivory disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={edges.end}
            aria-label={`Scroll ${label} forwards`}
            className="pointer-events-auto grid h-11 w-11 place-items-center border border-line-strong text-ivory transition-colors hover:border-ivory disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
