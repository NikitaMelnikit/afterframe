import { MotionConfig, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { supportsViewTransitions } from '@/lib/platform';
import { EASE_CINEMA } from '@/lib/motion';
import { SearchProvider } from '@/state/search';
import { ToastProvider } from '@/state/toast';
import { WatchlistProvider } from '@/state/watchlist';
import { SearchOverlay } from '../search/SearchOverlay';
import { Footer } from './Footer';
import { Navigation } from './Navigation';

export function RootLayout() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);

  // Move focus to the new page on client-side navigation so assistive tech announces it.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <WatchlistProvider>
          <SearchProvider>
            <Navigation />
            <main id="main" ref={main} tabIndex={-1} className="relative min-h-[100dvh] focus:outline-none">
              {supportsViewTransitions ? (
                <Outlet />
              ) : (
                // Browsers without View Transitions get a light opacity/position entrance instead.
                <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_CINEMA }}>
                  <Outlet />
                </motion.div>
              )}
            </main>
            <Footer />
            <SearchOverlay />
            <div className="grain" aria-hidden />
            {/* Full page loads share the "default" key, so key those by path to avoid inheriting another page's scroll. */}
            <ScrollRestoration getKey={(loc) => (loc.key === 'default' ? loc.pathname : loc.key)} />
          </SearchProvider>
        </WatchlistProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
