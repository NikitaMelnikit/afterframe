import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { MovieSummary } from '@/data/types';
import { cn } from '@/lib/cn';
import { formatRuntime, pad } from '@/lib/format';
import { markSharedPoster } from '@/lib/platform';
import { Poster } from './Poster';
import { WatchlistButton } from './WatchlistButton';

interface FilmCardProps {
  film: MovieSummary;
  /** Optional editorial descriptor shown instead of genres. */
  descriptor?: string;
  index?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  showRuntime?: boolean;
}

export function FilmCard({ film, descriptor, index, sizes, priority, className, showRuntime }: FilmCardProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const meta = descriptor ?? film.genres.slice(0, 2).join(' / ');
  const runtime = showRuntime ? formatRuntime(film.runtime) : null;

  return (
    <article className={cn('group relative', className)}>
      <Link
        to={`/film/${film.id}`}
        state={{ film }}
        viewTransition
        onClick={() => markSharedPoster(posterRef.current)}
        className="block"
      >
        <div className="relative overflow-hidden">
          <Poster
            ref={posterRef}
            title={film.title}
            year={film.year}
            path={film.posterPath}
            palette={film.palette}
            sizes={sizes}
            priority={priority}
            imgClassName="group-hover:scale-[1.045] transition-[transform,opacity] duration-[900ms]"
          />
          {/* Hover layer: extra context only — title and year always remain visible below. */}
          <div className="pointer-events-none absolute inset-0 hidden flex-col justify-end bg-gradient-to-t from-ink/90 via-ink/30 to-transparent p-4 opacity-0 transition-opacity duration-500 ease-cinema group-hover:opacity-100 [@media(hover:hover)]:flex">
            {film.overview && <p className="line-clamp-4 text-[0.8rem] leading-snug text-ivory/85">{film.overview}</p>}
            <span className="mt-3 inline-flex items-center gap-1 font-mono text-micro uppercase text-acid">
              View film <ArrowUpRight className="h-3 w-3" aria-hidden />
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-3 pr-1">
          {index != null && <span className="pt-[0.2rem] font-mono text-micro text-silver">{pad(index + 1)}</span>}
          <div className="min-w-0">
            <h3 className="font-display text-[0.98rem] font-medium leading-tight tracking-[-0.01em] text-ivory transition-colors group-hover:text-white">
              {film.title}
            </h3>
            <p className="mt-1 truncate font-mono text-micro text-silver">
              {[film.year, runtime, meta].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      </Link>
      <WatchlistButton film={film} className="absolute right-2 top-2 z-10" />
    </article>
  );
}

export function FilmCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="skeleton aspect-poster w-full" />
      <div className="skeleton mt-3 h-4 w-3/4" />
      <div className="skeleton mt-2 h-3 w-1/2" />
    </div>
  );
}
