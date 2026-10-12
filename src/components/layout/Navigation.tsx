import { Menu, Search, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSurprise } from '@/hooks/useSurprise';
import { cn } from '@/lib/cn';
import { EASE_CINEMA } from '@/lib/motion';
import { shortcutLabel } from '@/lib/platform';
import { RETURNING_VISITOR } from '@/state/intro';
import { useSearch } from '@/state/search';
import { useWatchlist } from '@/state/watchlist';
import { MobileMenu } from './MobileMenu';
import { NAV_ITEMS } from './nav-items';
import { Wordmark } from './Wordmark';

export function Navigation() {
  const { pathname } = useLocation();
  const { openSearch } = useSearch();
  const { items } = useWatchlist();
  const surprise = useSurprise();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // The wordmark joins the hero's opening sequence only on a first visit to the homepage.
  const [introDelay] = useState(() => (pathname === '/' ? (RETURNING_VISITOR ? 0.15 : 0.55) : 0));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <a
        href="#main"
        className="fixed left-gutter top-3 z-[100] -translate-y-24 bg-acid px-4 py-2 font-mono text-micro uppercase text-ink transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        style={{ viewTransitionName: 'site-nav' }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,height,backdrop-filter] duration-500 ease-cinema',
          scrolled ? 'h-14 border-line bg-ink/80 backdrop-blur-xl' : 'h-[4.5rem] border-transparent bg-gradient-to-b from-ink/60 to-transparent',
        )}
      >
        <motion.nav
          aria-label="Primary"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: introDelay, ease: EASE_CINEMA }}
          className="frame flex h-full items-center justify-between gap-6"
        >
          <Link to="/" viewTransition aria-label="AFTERFRAME — home" className="text-[1.05rem] md:text-[1.15rem]">
            <Wordmark />
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  viewTransition
                  className={({ isActive }) =>
                    cn(
                      'group relative inline-flex items-center gap-2 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors',
                      isActive ? 'text-ivory' : 'text-silver hover:text-ivory',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {item.to === '/watchlist' && items.length > 0 && (
                        <span className="min-w-[1.25rem] bg-ivory/10 px-1 text-center text-[0.65rem] text-ivory" aria-label={`${items.length} saved`}>
                          {items.length}
                        </span>
                      )}
                      <span
                        aria-hidden
                        className={cn(
                          'absolute -bottom-0.5 left-0 h-px bg-acid transition-all duration-500 ease-cinema',
                          isActive ? 'w-full' : 'w-0 group-hover:w-full',
                        )}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={openSearch}
              aria-label={`Search films (${shortcutLabel})`}
              className="inline-flex h-11 items-center gap-3 px-3 text-silver transition-colors hover:text-ivory"
            >
              <Search className="h-[1.1rem] w-[1.1rem]" aria-hidden />
              <span className="hidden font-mono text-[0.68rem] uppercase tracking-[0.12em] md:inline">Search</span>
              <kbd className="hidden border border-line px-1.5 py-0.5 font-mono text-[0.62rem] text-silver md:inline">{shortcutLabel}</kbd>
            </button>
            <button
              type="button"
              onClick={surprise}
              className="group hidden h-11 items-center gap-2 border border-line px-4 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ivory transition-colors hover:border-acid sm:inline-flex"
            >
              <Shuffle className="h-3.5 w-3.5 text-acid transition-transform duration-500 ease-cinema group-hover:rotate-180" aria-hidden />
              Surprise me
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="grid h-11 w-11 place-items-center text-ivory lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </motion.nav>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={openSearch} onSurprise={surprise} />
    </>
  );
}
