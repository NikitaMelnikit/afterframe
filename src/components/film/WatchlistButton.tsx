import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { MovieSummary } from '@/data/types';
import { cn } from '@/lib/cn';
import { useWatchlist } from '@/state/watchlist';

interface Props {
  film: MovieSummary;
  variant?: 'icon' | 'full' | 'inline';
  className?: string;
}

export function WatchlistButton({ film, variant = 'icon', className }: Props) {
  const { has, toggle } = useWatchlist();
  const saved = has(film.id);
  const label = saved ? `Remove ${film.title} from your watchlist` : `Add ${film.title} to your watchlist`;
  const Icon = saved ? BookmarkCheck : Bookmark;

  if (variant === 'full') {
    return (
      <button type="button" onClick={() => toggle(film)} aria-pressed={saved} className={cn(saved ? 'btn-ghost border-acid' : 'btn-ghost', className)}>
        <Icon className={cn('h-4 w-4', saved && 'text-acid')} aria-hidden />
        {saved ? 'In your watchlist' : 'Add to watchlist'}
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={() => toggle(film)}
        aria-pressed={saved}
        aria-label={label}
        className={cn('inline-flex min-h-[2.75rem] items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors', saved ? 'text-acid' : 'text-silver hover:text-ivory', className)}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(film)}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
      className={cn(
        'grid h-10 w-10 place-items-center border backdrop-blur-md transition-all duration-300 ease-cinema',
        saved ? 'border-acid bg-acid text-ink' : 'border-ivory/20 bg-ink/55 text-ivory hover:border-ivory hover:bg-ink/80',
        className,
      )}
    >
      <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
