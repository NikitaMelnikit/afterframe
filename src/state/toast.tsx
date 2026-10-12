import { AnimatePresence, motion } from 'motion/react';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { EASE_CINEMA } from '@/lib/motion';

interface Toast {
  id: number;
  message: string;
  action?: { label: string; to: string };
}

const ToastContext = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number>(undefined);
  const seq = useRef(0);

  const notify = useCallback((t: Omit<Toast, 'id'>) => {
    window.clearTimeout(timer.current);
    setToast({ ...t, id: ++seq.current });
    timer.current = window.setTimeout(() => setToast(null), 3400);
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-gutter pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:justify-start">
        {/* Polite live region so screen readers hear watchlist changes. */}
        <div role="status" aria-live="polite" className="sr-only">
          {toast?.message}
        </div>
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4, ease: EASE_CINEMA }}
              className="pointer-events-auto flex items-center gap-4 border border-line-strong bg-charcoal/95 py-3 pl-4 pr-3 text-sm text-ivory shadow-2xl shadow-black/60 backdrop-blur"
            >
              <span className="h-1.5 w-1.5 shrink-0 bg-acid" aria-hidden />
              <span aria-hidden>{toast.message}</span>
              {toast.action && (
                <Link
                  to={toast.action.to}
                  viewTransition
                  className="ml-2 font-mono text-micro uppercase text-acid underline-offset-4 hover:underline"
                >
                  {toast.action.label}
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
