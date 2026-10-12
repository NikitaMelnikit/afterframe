export const isMac =
  typeof navigator !== 'undefined' &&
  /mac|iphone|ipad|ipod/i.test(
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? navigator.userAgent,
  );

export const shortcutLabel = isMac ? '⌘K' : 'Ctrl K';

export const supportsViewTransitions = typeof document !== 'undefined' && 'startViewTransition' in document;

/**
 * Marks one element as the shared poster for the next view transition.
 * Only one element may carry a given view-transition-name at a time, so any
 * previous holder is cleared first.
 */
export function markSharedPoster(el: HTMLElement | null) {
  if (!el || !supportsViewTransitions) return;
  document.querySelectorAll<HTMLElement>('[data-shared-poster]').forEach((node) => {
    node.style.viewTransitionName = '';
    node.removeAttribute('data-shared-poster');
  });
  el.style.viewTransitionName = 'film-poster';
  el.setAttribute('data-shared-poster', '');
}
