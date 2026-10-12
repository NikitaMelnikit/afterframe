import type { SortKey } from '@/data/types';

export interface FilterValue {
  genre: string | null;
  decade: number | null;
  minRating: number | null;
  sort: SortKey;
}

export const EMPTY_FILTERS: FilterValue = { genre: null, decade: null, minRating: null, sort: 'relevance' };

export const RATING_STEPS = [6, 7, 8];

/** Rating sort only exists when the data source has verified ratings (TMDB). */
export function sortOptions(hasRatings: boolean): { value: SortKey; label: string }[] {
  return [
    { value: 'relevance', label: hasRatings ? 'Most popular' : 'Editor’s order' },
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'title', label: 'Title A–Z' },
    ...(hasRatings ? [{ value: 'rating' as SortKey, label: 'Highest rated (TMDB)' }] : []),
  ];
}
