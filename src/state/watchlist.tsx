import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { MovieSummary } from '@/data/types';
import { useToast } from './toast';

/**
 * Watchlist persisted to localStorage. Entries store a small snapshot of the
 * film so the list can render even if the data source later can't resolve it.
 */
export interface WatchlistEntry {
  id: number;
  title: string;
  year: number | null;
  genres: string[];
  posterPath: string | null;
  backdropPath: string | null;
  runtime: number | null;
  palette?: [string, string];
  addedAt: number;
}

const STORAGE_KEY = 'afterframe:watchlist:v1';

function isEntry(x: unknown): x is WatchlistEntry {
  if (!x || typeof x !== 'object') return false;
  const e = x as Record<string, unknown>;
  return typeof e.id === 'number' && typeof e.title === 'string';
}

function read(): WatchlistEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(isEntry).map((e) => ({
          ...e,
          year: typeof e.year === 'number' ? e.year : null,
          genres: Array.isArray(e.genres) ? e.genres : [],
          posterPath: e.posterPath ?? null,
          backdropPath: e.backdropPath ?? null,
          runtime: e.runtime ?? null,
          addedAt: typeof e.addedAt === 'number' ? e.addedAt : Date.now(),
        }))
      : [];
  } catch {
    return [];
  }
}

function write(items: WatchlistEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* Storage full or unavailable (private mode) — keep in-memory state. */
  }
}

interface WatchlistValue {
  items: WatchlistEntry[];
  ids: Set<number>;
  has: (id: number) => boolean;
  toggle: (film: MovieSummary) => void;
  remove: (id: number) => void;
}

const WatchlistContext = createContext<WatchlistValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WatchlistEntry[]>(read);
  const notify = useToast();

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Always read and write through a ref so rapid consecutive toggles never act on a stale list.
  const latest = useRef(items);
  latest.current = items;
  const commit = useCallback((next: WatchlistEntry[]) => {
    latest.current = next;
    setItems(next);
    write(next);
  }, []);

  const ids = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const remove = useCallback(
    (id: number) => {
      const film = latest.current.find((i) => i.id === id);
      commit(latest.current.filter((i) => i.id !== id));
      if (film) notify({ message: `Removed “${film.title}” from your watchlist` });
    },
    [commit, notify],
  );

  const toggle = useCallback(
    (film: MovieSummary) => {
      if (latest.current.some((i) => i.id === film.id)) {
        remove(film.id);
        return;
      }
      const entry: WatchlistEntry = {
        id: film.id,
        title: film.title,
        year: film.year,
        genres: film.genres,
        posterPath: film.posterPath,
        backdropPath: film.backdropPath,
        runtime: film.runtime ?? null,
        palette: film.palette,
        addedAt: Date.now(),
      };
      commit([entry, ...latest.current]);
      notify({ message: `Saved “${film.title}”`, action: { label: 'View list', to: '/watchlist' } });
    },
    [commit, remove, notify],
  );

  const value = useMemo<WatchlistValue>(() => ({ items, ids, has: (id) => ids.has(id), toggle, remove }), [items, ids, toggle, remove]);
  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used inside <WatchlistProvider>');
  return ctx;
}

/** Converts a saved entry back into a summary for shared card components. */
export function entryToSummary(e: WatchlistEntry): MovieSummary {
  return {
    id: e.id,
    title: e.title,
    year: e.year,
    genres: e.genres,
    posterPath: e.posterPath,
    backdropPath: e.backdropPath,
    runtime: e.runtime,
    palette: e.palette,
    source: 'offline',
  };
}
