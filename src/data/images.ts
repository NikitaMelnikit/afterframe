/**
 * TMDB image CDN helpers. Paths in the offline edition were individually
 * verified against the CDN; anything unverified is stored as `null` and
 * rendered with a designed fallback instead.
 */
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';

export function tmdbImage(path: string | null | undefined, size: PosterSize | BackdropSize | 'w45' | 'h632') {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function posterSrcSet(path: string | null | undefined) {
  if (!path) return undefined;
  return (['w154', 'w342', 'w500', 'w780'] as const)
    .map((s) => `${IMAGE_BASE}/${s}${path} ${s.slice(1)}w`)
    .join(', ');
}

export function backdropSrcSet(path: string | null | undefined) {
  if (!path) return undefined;
  return `${IMAGE_BASE}/w780${path} 780w, ${IMAGE_BASE}/w1280${path} 1280w, ${IMAGE_BASE}/original${path} 1920w`;
}

/** Deterministic two-tone palette for films that arrive without one. */
export function paletteFor(seed: string | number): [string, string] {
  const str = String(seed);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const hue2 = (hue + 28 + (h % 40)) % 360;
  return [`hsl(${hue} 38% 34%)`, `hsl(${hue2} 30% 9%)`];
}
