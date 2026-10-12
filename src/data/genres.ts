/** TMDB's movie genre ids. These are stable and documented, so we avoid an extra request. */
export const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export const GENRE_IDS: Record<string, number> = Object.fromEntries(
  Object.entries(TMDB_GENRES).map(([id, name]) => [name, Number(id)]),
);

/** Genres offered in the Discover filters (TV Movie omitted on purpose). */
export const FILTER_GENRES = [
  'Drama',
  'Science Fiction',
  'Thriller',
  'Mystery',
  'Romance',
  'Animation',
  'Fantasy',
  'Horror',
  'Comedy',
  'Crime',
  'Action',
  'Adventure',
  'Music',
  'History',
  'War',
  'Family',
];

export const DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950];
