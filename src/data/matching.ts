import { EDITORIAL_RANK, LOCAL_FILMS } from './films';
import { FEELINGS, MOOD_TAG_LABELS, TIME_OPTIONS } from './moods';
import type { LocalFilm, MoodPreferences, MoodTag, TimeWindow, Trait } from './types';
import { formatRuntime } from '@/lib/format';

/**
 * Explicit, explainable matching. There is no AI here: every recommendation
 * is a weighted sum of editorial mood tags, genres, runtime and traits, and
 * every point awarded produces a human-readable reason.
 */

export function fitsWindow(runtime: number | null | undefined, window: TimeWindow) {
  if (window === 'any' || runtime == null) return true;
  const opt = TIME_OPTIONS.find((t) => t.id === window);
  if (!opt) return true;
  return (opt.min == null || runtime >= opt.min) && (opt.max == null || runtime <= opt.max);
}

const TRAIT_REASONS: Record<Trait, string> = {
  familiar: 'A widely discussed film — easy to find someone to talk it through with',
  unusual: 'Off the beaten path; an editor’s left-field pick',
  visual: 'Flagged by our editors for its visual ambition',
  intense: 'Built to shake you — emotionally full-strength',
  easy: 'Low effort, high reward: an easy, generous watch',
};

function list(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} & ${items[items.length - 1]}`;
}

export interface LocalMatch {
  film: LocalFilm;
  score: number;
  reasons: string[];
  exact: boolean;
}

export function scoreFilm(film: LocalFilm, prefs: MoodPreferences): LocalMatch {
  let score = 0;
  const reasons: string[] = [];
  let exact = true;

  if (prefs.feeling) {
    const feeling = FEELINGS.find((f) => f.id === prefs.feeling)!;
    const tagHits = film.moods.filter((m) => feeling.tags.includes(m));
    const genreHits = film.genres.filter((g) => feeling.genres.includes(g));
    score += tagHits.length * 4 + genreHits.length * 1.25;
    if (tagHits.length) {
      const labels = tagHits.map((t) => MOOD_TAG_LABELS[t]);
      const direct = labels.some((l) => l.toLowerCase() === feeling.label.toLowerCase());
      reasons.push(
        `Carries our editors’ “${list(labels)}” tag${tagHits.length > 1 ? 's' : ''}${direct ? '' : ` — a route into ${feeling.label.toLowerCase()}`}`,
      );
    } else {
      exact = false;
    }
    if (genreHits.length) reasons.push(`${list(genreHits)} sit${genreHits.length === 1 ? 's' : ''} squarely in ${feeling.label.toLowerCase()} territory`);
  }

  if (prefs.time !== 'any') {
    if (fitsWindow(film.runtime, prefs.time)) {
      score += 3;
      reasons.push(`Runs ${formatRuntime(film.runtime)} — inside your window`);
    } else {
      const opt = TIME_OPTIONS.find((t) => t.id === prefs.time)!;
      const distance = opt.max != null && film.runtime > opt.max ? film.runtime - opt.max : (opt.min ?? 0) - film.runtime;
      score -= Math.min(4, 1 + distance / 15);
      exact = false;
    }
  }

  if (prefs.trait) {
    if (film.traits.includes(prefs.trait)) {
      score += 3;
      reasons.push(TRAIT_REASONS[prefs.trait]);
    } else {
      exact = false;
    }
  }

  // Gentle editorial tie-breaker so ordering is stable and curated.
  const rank = EDITORIAL_RANK.get(film.id) ?? LOCAL_FILMS.length;
  score += (1 - rank / LOCAL_FILMS.length) * 0.6;

  if (!reasons.length) reasons.push(film.note ?? 'An editor’s pick from the AFTERFRAME library');
  return { film, score, reasons, exact };
}

export function recommendLocal(prefs: MoodPreferences, limit = 6): LocalMatch[] {
  const scored = LOCAL_FILMS.map((f) => scoreFilm(f, prefs)).sort((a, b) => b.score - a.score);
  const exact = scored.filter((s) => s.exact);
  // Prefer exact matches, then fill with the closest alternatives so the screen is never empty.
  const picked = [...exact.slice(0, limit)];
  for (const s of scored) {
    if (picked.length >= limit) break;
    if (!picked.includes(s)) picked.push(s);
  }
  return picked;
}

/** Metadata similarity used offline and as a fallback for "Similar films". */
export function similarLocal(film: Pick<LocalFilm, 'id' | 'genres' | 'director' | 'year'> & { moods?: MoodTag[]; traits?: Trait[] }, limit = 10) {
  return LOCAL_FILMS.filter((f) => f.id !== film.id)
    .map((f) => {
      let s = 0;
      s += f.genres.filter((g) => film.genres.includes(g)).length * 2;
      s += (film.moods ?? []).filter((m) => f.moods.includes(m)).length * 2;
      s += (film.traits ?? []).filter((t) => f.traits.includes(t)).length * 0.5;
      if (f.director === film.director) s += 3;
      if (film.year && Math.abs(f.year - film.year) <= 10) s += 0.5;
      return { f, s };
    })
    .filter((x) => x.s > 1)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.f);
}

/** "Films in your orbit": similarity to everything saved, excluding saved films. */
export function orbitFor(savedIds: number[], limit = 12) {
  const saved = savedIds.map((id) => LOCAL_FILMS.find((f) => f.id === id)).filter(Boolean) as LocalFilm[];
  if (!saved.length) return null;
  const scores = new Map<number, number>();
  for (const s of saved) {
    similarLocal(s, 20).forEach((f, i) => {
      if (savedIds.includes(f.id)) return;
      scores.set(f.id, (scores.get(f.id) ?? 0) + (20 - i));
    });
  }
  const ids = [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
  return ids.length >= 4 ? { ids, basis: saved[0] } : null;
}
