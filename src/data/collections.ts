import { ALT_FRAMES, LOCAL_FILM_MAP } from './films';
import type { Collection } from './types';

/**
 * Editorial collections. To add one, append an entry: the index page, home
 * section and `/collections/:slug` route all derive from this list.
 * Film counts are always computed from `filmIds` that exist in the dataset.
 */
const DEFINITIONS: (Collection & { coverPath?: string })[] = [
  {
    slug: 'after-midnight',
    number: '01',
    title: 'After Midnight',
    description: 'Films for the hours that blur together.',
    intro:
      'Neon on wet asphalt, hotel bars with nobody left in them, conversations that only happen after the last train. These are films that feel best with the lights off and the city still humming outside — stories about insomniacs, drifters and people who are most themselves when everyone else is asleep.',
    filmIds: [64690, 153, 11104, 1018, 843, 949, 103, 335984, 152601, 245891],
    coverFilmId: 335984,
    coverPath: ALT_FRAMES.bladeRunnerSpinner,
    accent: '#D03C82',
    variant: 'wide',
  },
  {
    slug: 'beautifully-broken',
    number: '02',
    title: 'Beautifully Broken',
    description: 'Intimate, emotionally complex stories.',
    intro:
      'Quiet films with long half-lives. Fathers remembered through camcorder footage, lovers separated by oceans and decades, people relearning how to hear the world. None of them shout. All of them stay with you for days.',
    filmIds: [965150, 376867, 666277, 531428, 38, 502033, 428449, 76, 840430],
    coverFilmId: 965150,
    accent: '#7C8FA0',
    variant: 'tall',
  },
  {
    slug: 'elsewhere',
    number: '03',
    title: 'Elsewhere',
    description: 'Worlds that feel impossible to leave.',
    intro:
      'Bathhouses for spirits, desert planets, walking castles and hotels that exist only in memory. The common thread is total immersion: worlds built with so much care that you leave them reluctantly, and find yourself thinking about their weather and architecture for days afterwards.',
    filmIds: [129, 693134, 438631, 1417, 4935, 120467, 128, 792307, 10681, 372058],
    coverFilmId: 129,
    coverPath: ALT_FRAMES.spiritedAwayLanterns,
    accent: '#C7652A',
    variant: 'split',
  },
  {
    slug: 'the-slow-burn',
    number: '04',
    title: 'The Slow Burn',
    description: 'Stories that reward patience.',
    intro:
      'Long takes, longer silences, and payoffs that arrive only because the film earned them. This is cinema that asks for your attention rather than grabbing it — and gives back something you could not have reached any faster.',
    filmIds: [62, 1398, 1949, 7345, 491584, 329865, 467244, 6977, 346, 915935],
    coverFilmId: 62,
    accent: '#C9342C',
    variant: 'type',
  },
  {
    slug: 'reality-rewritten',
    number: '05',
    title: 'Reality, Rewritten',
    description: 'Films that challenge perception.',
    intro:
      'Dreams within dreams, simulations, parallel dinner parties and memories that run backwards. These films pull the floor out from under you, then invite you to enjoy the fall. Best watched with someone you can argue with afterwards.',
    filmIds: [603, 27205, 4977, 14337, 220289, 37165, 545611, 300668, 10494, 77],
    coverFilmId: 27205,
    accent: '#4E8FC8',
    variant: 'stack',
  },
  {
    slug: 'the-final-twist',
    number: '06',
    title: 'The Final Twist',
    description: 'Stories best experienced without spoilers.',
    intro:
      'Close the tabs, mute the group chat, avoid the comment sections. Each of these films is built around a turn you should meet unprepared. We will not even hint at what kind of turn — only that it is worth protecting.',
    filmIds: [496243, 1124, 670, 745, 11324, 210577, 807, 550, 290098, 546554, 146233],
    coverFilmId: 496243,
    coverPath: ALT_FRAMES.parasitePortrait,
    accent: '#D7FF45',
    variant: 'band',
  },
];

export interface ResolvedCollection extends Collection {
  coverPath: string | null;
  coverKind: 'backdrop' | 'poster' | 'none';
  /** Film ids that exist in the dataset (drives counts). */
  availableIds: number[];
}

export const COLLECTIONS: ResolvedCollection[] = DEFINITIONS.map((c) => {
  const cover = LOCAL_FILM_MAP.get(c.coverFilmId);
  const coverPath = c.coverPath ?? cover?.backdrop ?? cover?.poster ?? null;
  const coverKind = c.coverPath || cover?.backdrop ? 'backdrop' : cover?.poster ? 'poster' : 'none';
  return {
    ...c,
    coverPath,
    coverKind,
    availableIds: c.filmIds.filter((id) => LOCAL_FILM_MAP.has(id)),
  };
});

export function getCollection(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug) ?? null;
}

/** Collections that contain a given film — used for contextual links on film pages. */
export function collectionsForFilm(id: number) {
  return COLLECTIONS.filter((c) => c.availableIds.includes(id));
}
