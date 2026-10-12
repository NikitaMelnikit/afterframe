import { ExternalLink, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Trailer } from '@/data/types';
import { useDialog } from '@/hooks/useDialog';
import { EASE_CINEMA } from '@/lib/motion';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  year?: number | null;
  trailer: Trailer | null;
  live: boolean;
}

export function TrailerModal({ open, onClose, title, year, trailer, live }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useDialog(open, panel, onClose, closeBtn);
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${year ?? ''} official trailer`)}`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-[max(0.75rem,env(safe-area-inset-left))] md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button type="button" aria-label="Close trailer" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-ink/90 backdrop-blur-sm" />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trailer-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: EASE_CINEMA }}
            className="relative w-full max-w-6xl"
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 id="trailer-title" className="truncate font-mono text-micro uppercase text-silver">
                {trailer ? trailer.name : 'Trailer'} — <span className="text-ivory">{title}</span>
              </h2>
              <button ref={closeBtn} type="button" onClick={onClose} className="btn-ghost min-h-[2.5rem] px-4">
                <X className="h-4 w-4" aria-hidden /> Close
              </button>
            </div>
            {trailer ? (
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {/* Muted autoplay: motion without sound until the viewer chooses. */}
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}?autoplay=1&mute=1&rel=0&playsinline=1&modestbranding=1`}
                  title={`${title} — ${trailer.name}`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <div className="relative flex aspect-video w-full flex-col items-start justify-end overflow-hidden border border-line bg-charcoal p-6 md:p-12">
                <div className="absolute inset-0 bg-[radial-gradient(70%_90%_at_80%_10%,rgba(116,44,53,0.45),transparent_70%)]" aria-hidden />
                <span className="eyebrow relative">No trailer on file</span>
                <p className="relative mt-4 max-w-2xl font-display text-2xl font-semibold uppercase leading-[0.95] tracking-tight md:text-5xl">
                  This one prefers to be seen, not previewed.
                </p>
                <p className="relative mt-4 max-w-xl text-sm leading-relaxed text-silver">
                  {live
                    ? 'TMDB doesn’t list an official trailer for this film.'
                    : 'The offline edition doesn’t include trailer data. Connect a TMDB API key to load official trailers.'}{' '}
                  You can still search for one on YouTube.
                </p>
                <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="btn-primary relative mt-8">
                  Search YouTube <ExternalLink className="h-4 w-4" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
