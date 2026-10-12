/**
 * The full cinematic intro plays once per browser. Returning visitors get a
 * shortened version so the content is never held hostage by the animation.
 */
const KEY = 'afterframe:intro-seen';

function readSeen() {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export const RETURNING_VISITOR = typeof window !== 'undefined' && readSeen();

export function markIntroSeen() {
  try {
    window.localStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}
