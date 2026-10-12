import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog behaviour: locks page scroll, traps Tab focus inside the
 * container, closes on Escape and restores focus to the opener on close.
 */
export function useDialog(open: boolean, containerRef: RefObject<HTMLElement | null>, onClose: () => void, initialFocus?: RefObject<HTMLElement | null>) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const { style } = document.documentElement;
    const prevOverflow = style.overflow;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    style.overflow = 'hidden';
    if (scrollbar > 0) style.paddingRight = `${scrollbar}px`;

    const focusFirst = () => {
      const target = initialFocus?.current ?? containerRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? containerRef.current;
      target?.focus({ preventScroll: true });
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !containerRef.current) return;
      const nodes = [...containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      style.overflow = prevOverflow;
      style.paddingRight = '';
      opener?.focus?.({ preventScroll: true });
    };
  }, [open, containerRef, initialFocus]);
}
