import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface SearchValue {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  // ⌘K on macOS, Ctrl+K elsewhere. Both are accepted so external keyboards behave.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({ open, openSearch, closeSearch }), [open, openSearch, closeSearch]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used inside <SearchProvider>');
  return ctx;
}
