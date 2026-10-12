import { ArrowUpRight, Search, Shuffle, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { useDialog } from '@/hooks/useDialog';
import { cn } from '@/lib/cn';
import { EASE_CINEMA, EASE_SHUTTER } from '@/lib/motion';
import { useWatchlist } from '@/state/watchlist';
import { NAV_ITEMS } from './nav-items';
import { Wordmark } from './Wordmark';

interface Props {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
  onSurprise: () => void;
}

export function MobileMenu({ open, onClose, onSearch, onSurprise }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const { items } = useWatchlist();
  const reduce = useReducedMotion();
  useDialog(open, panel, onClose);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE_SHUTTER }}
          className="fixed inset-0 z-[85] flex flex-col bg-ink pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]"
        >
          <div className="frame flex h-[4.5rem] shrink-0 items-center justify-between">
            <Wordmark className="text-[1.05rem]" />
            <button type="button" onClick={onClose} aria-label="Close menu" className="grid h-11 w-11 place-items-center text-ivory">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <nav aria-label="Mobile" className="frame flex-1 overflow-y-auto">
            <ul className="border-t border-line">
              {NAV_ITEMS.map((item, i) => (
                <motion.li
                  key={item.to}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: EASE_CINEMA }}
                  className="border-b border-line"
                >
                  <NavLink
                    to={item.to}
                    viewTransition
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn('flex min-h-[4.5rem] items-center justify-between gap-4 py-4', isActive ? 'text-ivory' : 'text-ivory/80')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="flex items-baseline gap-4">
                          <span className={cn('font-mono text-micro', isActive ? 'text-acid' : 'text-silver')}>0{i + 1}</span>
                          <span className="font-display text-[clamp(2rem,9vw,3.25rem)] font-semibold uppercase leading-none tracking-[-0.04em]">
                            {item.label}
                          </span>
                          {item.to === '/watchlist' && items.length > 0 && <span className="font-mono text-micro text-silver">({items.length})</span>}
                        </span>
                        <ArrowUpRight className="h-5 w-5 shrink-0 text-silver" aria-hidden />
                      </>
                    )}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSearch();
                }}
                className="btn-ghost px-3"
              >
                <Search className="h-4 w-4" aria-hidden /> Search
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSurprise();
                }}
                className="btn-primary px-3"
              >
                <Shuffle className="h-4 w-4" aria-hidden /> Surprise me
              </button>
            </div>
          </nav>

          <p className="frame mt-6 shrink-0 font-mono text-micro uppercase text-silver">Find the film that stays with you.</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
