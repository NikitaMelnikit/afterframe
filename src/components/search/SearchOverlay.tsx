import { ArrowRight, CornerDownLeft, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { LOCAL_FILM_MAP, LOCAL_FILMS } from '@/data/films';
import { tmdbImage } from '@/data/images';
import { repository } from '@/data/repository';
import { toSummary } from '@/data/repository/local';
import type { MovieSummary } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { useDialog } from '@/hooks/useDialog';
import { cn } from '@/lib/cn';
import { EASE_CINEMA } from '@/lib/motion';
import { useSearch } from '@/state/search';
import { PosterFallback } from '../film/Poster';

const SUGGESTED_IDS = [1018, 129, 4977, 843, 965150];

export function SearchOverlay() {
  const { open, closeSearch } = useSearch();
  const navigate = useNavigate();
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, 220);

  useDialog(open, panel, closeSearch, input);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const search = useAsync<MovieSummary[] | null>((signal) => (debounced ? repository.search(debounced, signal) : Promise.resolve(null)), [debounced]);

  const suggestions = useMemo(() => SUGGESTED_IDS.map((id) => LOCAL_FILM_MAP.get(id)).filter(Boolean).map((f) => toSummary(f!)), []);
  const pending = trimmed !== debounced || (Boolean(debounced) && search.status === 'loading');
  const results = trimmed ? (search.status === 'success' && !pending ? (search.data ?? []) : []) : suggestions;

  useEffect(() => setActive(0), [debounced, search.status]);

  const go = (film: MovieSummary) => {
    closeSearch();
    navigate(`/film/${film.id}`, { state: { film }, viewTransition: true });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[Math.min(active, results.length - 1)]);
    }
  };

  const optionId = (i: number) => `${listId}-opt-${i}`;
  const showList = results.length > 0;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <button type="button" tabIndex={-1} aria-label="Close search" onClick={closeSearch} className="absolute inset-0 cursor-default bg-ink/70 backdrop-blur-md" />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Search films"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_CINEMA }}
            className="relative max-h-[100dvh] overflow-y-auto border-b border-line bg-ink/95 pb-6 pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl shadow-black/70 md:max-h-[88vh]"
          >
            <div className="frame">
              <div className="flex h-14 items-center justify-between">
                <span className="eyebrow">{repository.mode === 'live' ? 'Search TMDB' : `Search the library · ${LOCAL_FILMS.length} films`}</span>
                <button type="button" onClick={closeSearch} className="inline-flex h-11 items-center gap-2 font-mono text-micro uppercase text-silver hover:text-ivory">
                  <kbd className="hidden border border-line px-1.5 py-0.5 sm:inline">Esc</kbd>
                  <X className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Close search</span>
                </button>
              </div>

              <div className="flex items-center gap-4 border-b border-line-strong pb-4 focus-within:border-acid">
                <Search className="h-6 w-6 shrink-0 text-silver md:h-8 md:w-8" aria-hidden />
                <label htmlFor="global-search" className="sr-only">
                  Search by title, director, actor, year or genre
                </label>
                <input
                  ref={input}
                  id="global-search"
                  type="search"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="A title, a director, a year…"
                  role="combobox"
                  aria-expanded={showList}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={showList ? optionId(active) : undefined}
                  className="min-w-0 flex-1 bg-transparent font-display text-[clamp(1.6rem,5vw,3.5rem)] font-medium tracking-[-0.03em] text-ivory placeholder:text-silver/40 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
              </div>

              <div className="mt-5 min-h-[12rem]" aria-live="polite" aria-busy={pending}>
                {!trimmed && <p className="eyebrow mb-3">Start somewhere</p>}

                {trimmed && pending && (
                  <ul className="space-y-1" aria-hidden>
                    {Array.from({ length: 4 }, (_, i) => (
                      <li key={i} className="flex items-center gap-4 py-2">
                        <div className="skeleton h-[4.5rem] w-12" />
                        <div className="flex-1 space-y-2">
                          <div className="skeleton h-4 w-1/3" />
                          <div className="skeleton h-3 w-1/5" />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {trimmed && !pending && search.status === 'error' && (
                  <div className="py-8">
                    <p className="font-display text-2xl font-semibold uppercase tracking-tight">The search reel snapped.</p>
                    <p className="mt-2 text-sm text-silver">We couldn’t reach the film database.</p>
                    <button type="button" onClick={search.reload} className="btn-ghost mt-5">
                      Try again
                    </button>
                  </div>
                )}

                {trimmed && !pending && search.status === 'success' && results.length === 0 && (
                  <div className="py-8">
                    <p className="font-display text-2xl font-semibold uppercase tracking-tight md:text-3xl">Nothing in frame for “{trimmed}”.</p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-silver">
                      Try a director’s surname, a single word from the title, or describe the night instead.
                    </p>
                    <Link to="/mood" viewTransition onClick={closeSearch} className="btn-link mt-5">
                      Open the Mood Finder <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                )}

                {showList && !(trimmed && pending) && (
                  <ul id={listId} role="listbox" aria-label={trimmed ? 'Search results' : 'Suggested films'} className="divide-y divide-line">
                    {results.map((film, i) => (
                      <li
                        key={film.id}
                        id={optionId(i)}
                        role="option"
                        aria-selected={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(film)}
                        className={cn(
                          'group flex cursor-pointer items-center gap-4 py-2.5 pl-2 pr-3 transition-colors',
                          i === active ? 'bg-ivory/[0.06]' : 'hover:bg-ivory/[0.03]',
                        )}
                      >
                        <span className={cn('h-10 w-px shrink-0 transition-colors', i === active ? 'bg-acid' : 'bg-transparent')} aria-hidden />
                        <span className="relative h-[4.5rem] w-12 shrink-0 overflow-hidden bg-charcoal">
                          {film.posterPath ? (
                            <img src={tmdbImage(film.posterPath, 'w92')!} alt="" loading="lazy" className="h-full w-full object-cover" />
                          ) : (
                            <PosterFallback title={film.title} palette={film.palette} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-lg font-medium tracking-tight text-ivory">{film.title}</span>
                          <span className="mt-0.5 block truncate font-mono text-micro text-silver">
                            {[film.year, film.genres.slice(0, 3).join(' / ')].filter(Boolean).join(' · ') || 'Details unavailable'}
                          </span>
                        </span>
                        <CornerDownLeft className={cn('h-4 w-4 shrink-0 text-silver transition-opacity', i === active ? 'opacity-100' : 'opacity-0')} aria-hidden />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                <p className="hidden gap-4 font-mono text-micro uppercase text-silver sm:flex">
                  <span>
                    <kbd className="border border-line px-1">↑</kbd> <kbd className="border border-line px-1">↓</kbd> Navigate
                  </span>
                  <span>
                    <kbd className="border border-line px-1">↵</kbd> Open
                  </span>
                  <span>
                    <kbd className="border border-line px-1">Esc</kbd> Close
                  </span>
                </p>
                {trimmed && (
                  <Link to={`/discover?q=${encodeURIComponent(trimmed)}`} viewTransition onClick={closeSearch} className="btn-link">
                    All results in Explore <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
