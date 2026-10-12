import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialog } from '@/hooks/useDialog';
import { EASE_CINEMA } from '@/lib/motion';
import { EMPTY_FILTERS, type FilterValue } from './filter-model';
import { StackedFilters } from './Filters';

interface Props {
  open: boolean;
  onClose: () => void;
  value: FilterValue;
  onApply: (v: FilterValue) => void;
  hasRatings: boolean;
}

export function FilterDrawer({ open, onClose, value, onApply, hasRatings }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(value);
  const current = useRef(value);
  current.current = value;
  useDialog(open, panel, onClose);

  // Start each session from the applied filters; parent re-renders must not wipe the draft.
  useEffect(() => {
    if (open) setDraft(current.current);
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[88]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" tabIndex={-1} aria-label="Close filters" onClick={onClose} className="absolute inset-0 cursor-default bg-ink/75 backdrop-blur-sm" />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filters-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5, ease: EASE_CINEMA }}
            className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col border-t border-line-strong bg-charcoal"
          >
            <div className="flex items-center justify-between px-gutter py-4">
              <h2 id="filters-title" className="font-display text-xl font-semibold uppercase tracking-tight">
                Filter the reel
              </h2>
              <button type="button" onClick={onClose} aria-label="Close filters" className="grid h-11 w-11 place-items-center text-ivory">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-gutter pb-6">
              <StackedFilters value={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} hasRatings={hasRatings} />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-line px-gutter pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              <button type="button" onClick={() => setDraft(EMPTY_FILTERS)} className="btn-ghost">
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply(draft);
                  onClose();
                }}
                className="btn-primary"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
