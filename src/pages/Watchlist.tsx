import { ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilmCard } from '@/components/film/FilmCard';
import { EmptyState } from '@/components/ui/States';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { formatRuntime } from '@/lib/format';
import { entryToSummary, useWatchlist } from '@/state/watchlist';

type Order = 'added' | 'title' | 'year';
const ORDERS: { id: Order; label: string }[] = [
  { id: 'added', label: 'Recently saved' },
  { id: 'title', label: 'Title' },
  { id: 'year', label: 'Release year' },
];

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

export default function Watchlist() {
  const { items } = useWatchlist();
  const [order, setOrder] = useState<Order>('added');
  useDocumentTitle(items.length ? `Watchlist (${items.length})` : 'Watchlist');

  const sorted = useMemo(() => {
    const copy = [...items];
    if (order === 'title') copy.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
    else if (order === 'year') copy.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    else copy.sort((a, b) => b.addedAt - a.addedAt);
    return copy;
  }, [items, order]);

  const known = items.filter((i) => i.runtime);
  const minutes = known.reduce((s, i) => s + (i.runtime ?? 0), 0);
  const count = items.length;
  const countWord = NUMBER_WORDS[count] ?? String(count);

  return (
    <div className="pb-24 pt-[calc(var(--nav-h)+3rem)] md:pt-[calc(var(--nav-h)+5rem)]">
      <div className="frame">
        <p className="eyebrow flex items-center gap-3">
          <span className="text-acid">(W)</span> My watchlist — saved on this device
        </p>

        {count === 0 ? (
          <EmptyState
            as="h1"
            className="mt-8"
            eyebrow="Nothing saved yet"
            title={
              <span className="block text-[clamp(2.6rem,8.5vw,8rem)] leading-[0.86] tracking-[-0.055em]">
                Your story starts
                <br /> with one film.
              </span>
            }
            body="Tap the bookmark on any film and it lands here — saved to this browser, ready for the night you need it."
            actions={
              <>
                <Link to="/discover" viewTransition className="btn-primary">
                  Explore films <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link to="/mood" viewTransition className="btn-ghost">
                  Find by mood
                </Link>
              </>
            }
          />
        ) : (
          <>
            <h1 className="mt-8 font-display text-[clamp(2.6rem,8.5vw,8.5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.055em]">
              {countWord} {count === 1 ? 'film' : 'films'}
              <br />
              <span className="text-silver">waiting for the lights</span>
              <br />
              to go down<span className="text-acid">.</span>
            </h1>
            <div className="mt-10 flex flex-col gap-6 border-y border-line py-5 md:flex-row md:items-center md:justify-between">
              <p className="font-mono text-micro uppercase text-silver">
                <span className="text-ivory">{count}</span> saved
                {minutes > 0 && (
                  <>
                    {' '}
                    · roughly <span className="text-ivory">{formatRuntime(minutes)}</span> of cinema
                    {known.length < count && ` (${known.length} with known runtimes)`}
                  </>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sort watchlist">
                {ORDERS.map((o) => (
                  <button key={o.id} type="button" aria-pressed={order === o.id} onClick={() => setOrder(o.id)} className={cn('chip')}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
              {sorted.map((entry) => (
                <li key={entry.id}>
                  <FilmCard film={entryToSummary(entry)} showRuntime sizes="(min-width:1280px) 18vw, (min-width:1024px) 22vw, (min-width:640px) 30vw, 46vw" />
                </li>
              ))}
            </ul>
            <p className="mt-16 max-w-lg text-xs leading-relaxed text-silver">
              Your watchlist lives in this browser’s local storage — no account, no sync. Use the bookmark on any card to remove a film.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
