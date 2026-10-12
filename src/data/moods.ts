import type { Feeling, MoodTag, TimeWindow, Trait } from './types';

/** Homepage "Choose your feeling" moods. Each links into the Mood Finder. */
export interface HomeMood {
  id: string;
  label: string;
  line: string;
  tag: MoodTag;
  feeling: Feeling;
  /** Film whose poster previews the mood. */
  previewFilmId: number;
}

export const HOME_MOODS: HomeMood[] = [
  { id: 'unsettling', label: 'Beautifully unsettling', line: 'Gorgeous, and wrong in ways you can’t name.', tag: 'unsettling', feeling: 'tension', previewFilmId: 530385 },
  { id: 'wonder', label: 'A little wonder', line: 'Worlds that make you feel eleven again.', tag: 'wonder', feeling: 'wonder', previewFilmId: 129 },
  { id: 'mindbending', label: 'Mind in pieces', line: 'Pull a thread. Watch the whole thing unravel.', tag: 'mindbending', feeling: 'surprise', previewFilmId: 1018 },
  { id: 'devastating', label: 'Quietly devastating', line: 'No explosions. Just the slow, true ache.', tag: 'devastating', feeling: 'melancholy', previewFilmId: 965150 },
  { id: 'adrenaline', label: 'Pure adrenaline', line: 'Forward motion, held breath, white knuckles.', tag: 'adrenaline', feeling: 'excitement', previewFilmId: 76341 },
  { id: 'unexpected', label: 'Something unexpected', line: 'You will not see where this is going.', tag: 'unexpected', feeling: 'surprise', previewFilmId: 545611 },
];

export interface FeelingOption {
  id: Feeling;
  label: string;
  line: string;
  tags: MoodTag[];
  genres: string[];
}

export const FEELINGS: FeelingOption[] = [
  { id: 'wonder', label: 'Wonder', line: 'Something vast, strange or beautiful.', tags: ['wonder'], genres: ['Fantasy', 'Science Fiction', 'Animation', 'Adventure'] },
  { id: 'tension', label: 'Tension', line: 'A knot in the stomach that won’t loosen.', tags: ['tension', 'unsettling'], genres: ['Thriller', 'Horror', 'Mystery', 'Crime'] },
  { id: 'comfort', label: 'Comfort', line: 'Warmth, wit and somewhere safe to land.', tags: ['comfort', 'funny'], genres: ['Comedy', 'Family', 'Animation', 'Romance'] },
  { id: 'melancholy', label: 'Melancholy', line: 'A beautiful ache. Tissues optional.', tags: ['melancholy', 'devastating'], genres: ['Drama', 'Romance'] },
  { id: 'excitement', label: 'Excitement', line: 'Speed, stakes and a racing pulse.', tags: ['adrenaline'], genres: ['Action', 'Adventure'] },
  { id: 'surprise', label: 'Surprise', line: 'Rules broken, expectations rearranged.', tags: ['unexpected', 'mindbending'], genres: ['Mystery', 'Science Fiction'] },
];

export interface TimeOption {
  id: TimeWindow;
  label: string;
  line: string;
  min?: number;
  max?: number;
}

export const TIME_OPTIONS: TimeOption[] = [
  { id: 'short', label: 'Under 1h 50', line: 'Something tight and complete.', max: 109 },
  { id: 'standard', label: '1h 50 – 2h 20', line: 'A proper evening.', min: 110, max: 140 },
  { id: 'long', label: 'Over 2h 20', line: 'Clear the night. Commit.', min: 141 },
  { id: 'any', label: 'Time is no object', line: 'Skip — runtime doesn’t matter.' },
];

export interface TraitOption {
  id: Trait;
  label: string;
  line: string;
}

export const TRAIT_OPTIONS: TraitOption[] = [
  { id: 'familiar', label: 'Something familiar', line: 'A film people talk about.' },
  { id: 'unusual', label: 'Something unusual', line: 'Off the beaten path.' },
  { id: 'visual', label: 'Visually ambitious', line: 'Frames worth pausing on.' },
  { id: 'intense', label: 'Emotionally intense', line: 'Ready to be shaken.' },
  { id: 'easy', label: 'Easy to watch', line: 'Low effort, high reward.' },
];

export const MOOD_TAG_LABELS: Record<MoodTag, string> = {
  unsettling: 'Unsettling',
  wonder: 'Wonder',
  mindbending: 'Mind-bending',
  devastating: 'Devastating',
  adrenaline: 'Adrenaline',
  unexpected: 'Unexpected',
  comfort: 'Comfort',
  tension: 'Tension',
  melancholy: 'Melancholy',
  romantic: 'Romantic',
  funny: 'Funny',
};
