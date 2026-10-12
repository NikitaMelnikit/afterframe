import { ArrowRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FilterDrawer } from '@/components/discover/FilterDrawer';
import { EMPTY_FILTERS, sortOptions, type FilterValue } from '@/components/discover/filter-model';
import { InlineFilters } from '@/components/discover/Filters';
import { FilmCard, FilmCardSkeleton } from '@/components/film/FilmCard';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { repository } from '@/data/repository';
import type { DiscoverResult, MovieSummary, SortKey } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';

const SORT_KEYS: SortKey[] = ['relevance', 'newest', 'oldest', 'title', 'rating'];

export default function Discover() {
  useDocumentTitle('Explore');
  const [params, setParams] = useSearchParams();
  const hasRatings = repository.hasRatings;

  // URL is the source of truth, so filtered views are shareable and survive refresh/back.
  const query = params.get('q') ?? '';
  const filters: FilterValue = {
    genre: params.get('genre'),
    decade: Number(params.get('decade')) || null,
    minRating: hasRatings ? Number(params.get('rating')) || null : null,
    sort: SORT_KEYS.includes(params.get('sort') as SortKey) && (hasRatings || params.get('sort') !== 'rating') ? (params.get('sort') as SortKey) : 'relevance',
  };

  const update = (patch: Partial<FilterValue> & { q?: string | null }) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const set = (k: string, v: string | number | null | undefined) => (v ? next.set(k, String(v)) : next.delete(k));
        if ('q' in patch) set('q', patch.q);
        if ('genre' in patch) set('genre', patch.genre);
        if ('decade' in patch) set('decade', patch.decade);
        if ('minRating' in patch) set('rating', patch.minRating);
        if ('sort' in patch) set('sort', patch.sort === 'relevance' ? null : patch.sort);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  /* ---- Debounced search input, kept in sync with the URL ---- */
  const [input, setInput] = useState(query);
  const debounced = useDebounce(input.trim(), 320);
  const pushed = useRef(query);
  useEffect(() => {
    if (debounced !== pushed.current) {
      pushed.current = debounced;
      update({ q: debounced || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  useEffect(() => {
    if (query !== pushed.current) {
      pushed.current = query;
      setInput(query);
    }
  }, [query]);

  /* ---- Paged loading ---- */
  const key = JSON.stringify([query, filters.genre, filters.decade, filters.minRating, filters.sort]);
  const [cursor, setCursor] = useState({ key, page: 1 });
  const page = cursor.key === key ? cursor.page : 1;
  const request = useAsync<DiscoverResult>((signal) => repository.discover({ query, ...filters, page }, signal), [key, page]);

  const [acc, setAcc] = useState<{ key: string; results: MovieSummary[]; meta: DiscoverResult } | null>(null);
  useEffect(() => {
    if (request.status !== 'success') return;
    const data = request.data;
    setAcc((prev) => {
      if (page === 1 || !prev || prev.key !== key) return { key, results: data.results, meta: data };
      const seen = new Set(prev.results.map((r) => r.id));
      return { key, results: [...prev.results, ...data.results.filter((r) => !seen.has(r.id))], meta: data };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.status, request.data]);

  const current = acc?.key === key ? acc : null;
  const results = current?.results ?? [];
  const stale = !current && acc && request.status === 'loading';
  const shown = stale ? acc.results : results;
  const initialLoading = request.status === 'loading' && page === 1 && !shown.length;
  const loadingMore = request.status === 'loading' && page > 1;
  const hasMore = current ? current.meta.page < current.meta.totalPages : false;

  /* ---- Active filter indicators ---- */
  const chips = useMemo(() => {
    const list: { label: string; clear: () => void }[] = [];
    if (query) list.push({ label: `“${query}”`, clear: () => (setInput(''), update({ q: null })) });
    if (filters.genre) list.push({ label: filters.genre, clear: () => update({ genre: null }) });
    if (filters.decade) list.push({ label: `${filters.decade}s`, clear: () => update({ decade: null }) });
    if (filters.minRating) list.push({ label: `${filters.minRating}+ rating`, clear: () => update({ minRating: null }) });
    if (filters.sort !== 'relevance') list.push({ label: sortOptions(hasRatings).find((o) => o.value === filters.sort)!.label, clear: () => update({ sort: 'relevance' }) });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const activeFilterCount = chips.filter((c) => !c.label.startsWith('“')).length;
  const clearAll = () => {
    setInput('');
    update({ q: null, ...EMPTY_FILTERS });
  };

  const [drawer, setDrawer] = useState(false);

  const countLabel = (() => {
    if (!current) return null;
    const total = current.meta.totalResults;
    if (total == null) return `Showing ${results.length}`;
    if (total === 0) return 'No films';
    return results.length < total ? `Showing ${results.length.toLocaleString('en')} of ${total.toLocaleString('en')} films` : `${total.toLocaleString('en')} ${total === 1 ? 'film' : 'films'}`;
  })();

  return (
    <div className="pb-24 pt-[calc(var(--nav-h)+3rem)] md:pt-[calc(var(--nav-h)+5rem)]">
      <header className="frame">
        <p className="eyebrow flex items-center gap-3">
          <span className="text-acid">(E)</span> Explore — {repository.mode === 'live' ? 'The full TMDB catalogue' : 'The AFTERFRAME library'}
        </p>
        <h1 className="mt-6 font-display font-semibold uppercase leading-[0.84] tracking-[-0.055em]">
          <span className="block text-[clamp(2.9rem,9vw,8.5rem)]">Find your</span>
          {/* The final period is allowed to run off the edge on wide screens. */}
          <span className="block whitespace-nowrap text-[clamp(2.9rem,12.4vw,13.5rem)] lg:-mr-[6vw]">
            next frame<span className="text-acid">.</span>
          </span>
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <p className="max-w-md text-silver md:col-span-5">
            Search by title, director, actor or year. Narrow the reel by genre and era — or just scroll until something looks back at you.
          </p>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="md:col-span-7">
            <label htmlFor="discover-search" className="eyebrow mb-2 block">
              Search films
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-silver" aria-hidden />
              <input
                id="discover-search"
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Try “Villeneuve”, “1994” or “dreams”"
                className="field h-14 pl-11 text-base [&::-webkit-search-cancel-button]:hidden"
                autoComplete="off"
              />
              {input && (
                <button type="button" onClick={() => setInput('')} aria-label="Clear search" className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-silver hover:text-ivory">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      {/* Filter bar */}
      <div className="frame mt-12">
        <div className="border-y border-line py-5">
          <div className="hidden md:block">
            <InlineFilters value={filters} onChange={update} hasRatings={hasRatings} />
          </div>
          <div className="flex items-center justify-between gap-4 md:hidden">
            <button type="button" onClick={() => setDrawer(true)} className="btn-ghost min-h-[2.75rem] px-4" aria-haspopup="dialog">
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </button>
            <span className="font-mono text-micro uppercase text-silver">{countLabel}</span>
          </div>
        </div>

        <div className="mt-5 flex min-h-[2.5rem] flex-wrap items-center justify-between gap-4">
          <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.label}>
                <button type="button" onClick={c.clear} data-active="true" className="chip" aria-label={`Remove filter ${c.label}`}>
                  {c.label} <X className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
            {chips.length > 1 && (
              <li>
                <button type="button" onClick={clearAll} className="ml-1 font-mono text-micro uppercase text-silver underline-offset-4 hover:text-ivory hover:underline">
                  Clear all
                </button>
              </li>
            )}
          </ul>
          <p className="hidden font-mono text-micro uppercase text-silver md:block" aria-live="polite">
            {countLabel}
          </p>
        </div>
      </div>

      {/* Results */}
      <section aria-label="Results" className="frame mt-10" aria-busy={request.status === 'loading'}>
        {request.status === 'error' && !shown.length ? (
          <ErrorState error={request.error} onRetry={request.reload} />
        ) : initialLoading ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-x-6 lg:grid-cols-5 2xl:grid-cols-6" aria-hidden>
            {Array.from({ length: 10 }, (_, i) => (
              <li key={i}>
                <FilmCardSkeleton />
              </li>
            ))}
          </ul>
        ) : current && results.length === 0 ? (
          <EmptyState
            eyebrow="Nothing in frame"
            title="No films match that combination."
            body={query ? <>Nothing for “{query}” with these filters. Loosen a filter, check the spelling, or describe the night instead.</> : 'Loosen a filter or two — or let the Mood Finder do the looking.'}
            actions={
              <>
                <button type="button" onClick={clearAll} className="btn-primary">
                  Clear all filters
                </button>
                <Link to="/mood" viewTransition className="btn-ghost">
                  Open the Mood Finder
                </Link>
              </>
            }
          />
        ) : (
          <>
            <ul className={cn('grid grid-cols-2 gap-x-4 gap-y-12 transition-opacity duration-300 sm:grid-cols-3 md:grid-cols-4 md:gap-x-6 lg:grid-cols-5 2xl:grid-cols-6', stale && 'opacity-40')}>
              {shown.map((film, i) => (
                <FragmentWithInterstitial key={film.id} index={i} total={shown.length}>
                  <li>
                    <FilmCard film={film} showRuntime sizes="(min-width:1600px) 15vw, (min-width:1024px) 19vw, (min-width:640px) 31vw, 46vw" priority={i < 4} />
                  </li>
                </FragmentWithInterstitial>
              ))}
              {loadingMore &&
                Array.from({ length: 5 }, (_, i) => (
                  <li key={`more-${i}`} aria-hidden>
                    <FilmCardSkeleton />
                  </li>
                ))}
            </ul>

            {request.status === 'error' && shown.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-line pt-6 text-sm text-silver">
                The next reel didn’t load.
                <button type="button" onClick={request.reload} className="btn-ghost min-h-[2.5rem]">
                  Try again
                </button>
              </div>
            )}

            {hasMore && request.status !== 'error' && (
              <div className="mt-16 flex flex-col items-center gap-4">
                <button type="button" onClick={() => setCursor({ key, page: page + 1 })} disabled={loadingMore} className="btn-ghost min-w-[14rem]">
                  {loadingMore ? 'Threading the next reel…' : 'Load more films'}
                </button>
                <span className="font-mono text-micro uppercase text-silver">{countLabel}</span>
              </div>
            )}
          </>
        )}
      </section>

      <FilterDrawer open={drawer} onClose={() => setDrawer(false)} value={filters} onApply={(v) => update(v)} hasRatings={hasRatings} />
    </div>
  );
}

/** After the 10th result, a quiet editorial aside breaks the grid's rhythm and offers another route. */
function FragmentWithInterstitial({ index, total, children }: { index: number; total: number; children: ReactNode }) {
  if (index !== 9 || total < 14) return <>{children}</>;
  return (
    <>
      {children}
      <li className="col-span-full my-4 border-y border-line py-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl font-display text-[clamp(1.5rem,3.2vw,2.75rem)] font-semibold uppercase leading-[0.95] tracking-[-0.035em]">
            Still scrolling? <span className="text-silver">Don’t search for a movie — describe the night.</span>
          </p>
          <Link to="/mood" viewTransition className="btn-link shrink-0">
            Mood Finder <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </li>
    </>
  );
}
