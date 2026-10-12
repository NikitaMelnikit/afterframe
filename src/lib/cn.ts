/** Tiny className joiner — avoids pulling in a dependency for one function. */
export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}
