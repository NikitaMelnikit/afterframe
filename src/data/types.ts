/**
 * Shared domain models. Both data sources (live TMDB and the curated offline
 * edition) are normalised into these shapes so page components never need to
 * know where a film came from.
 */

/** Editorial mood vocabulary used by AFTERFRAME's curators. */
export type MoodTag =
  | 'unsettling'
  | 'wonder'
  | 'mindbending'
  | 'devastating'
  | 'adrenaline'
  | 'unexpected'
  | 'comfort'
  | 'tension'
  | 'melancholy'
  | 'romantic'
  | 'funny';

/** Viewing-preference traits used by the Mood Finder. */
export type Trait = 'familiar' | 'unusual' | 'visual' | 'intense' | 'easy';

export type DataSource = 'live' | 'offline';

export interface MovieSummary {
  /** TMDB movie id. The offline edition uses the same ids so routes are stable across modes. */
  id: number;
  title: string;
  year: number | null;
  releaseDate?: string | null;
  genres: string[];
  posterPath: string | null;
  backdropPath: string | null;
  overview?: string;
  runtime?: number | null;
  /** TMDB vote average. Only ever populated from live TMDB data. */
  rating?: number | null;
  voteCount?: number | null;
  popularity?: number | null;
  /** Two-tone palette used by designed fallbacks and accent washes. */
  palette?: [string, string];
  source: DataSource;
}

export interface CastMember {
  id?: number;
  name: string;
  character?: string;
  profilePath?: string | null;
}

export interface CrewMember {
  id?: number;
  name: string;
  job: string;
}

export interface Trailer {
  key: string;
  name: string;
  site: 'YouTube';
  official: boolean;
}

export interface FactRow {
  label: string;
  value: string;
}

export interface MovieDetail extends MovieSummary {
  tagline?: string | null;
  originalTitle?: string | null;
  originalLanguage?: string | null;
  countries: string[];
  languages: string[];
  directors: string[];
  writers: string[];
  cast: CastMember[];
  crew: CrewMember[];
  /** True when cast/crew are abridged (offline edition). */
  creditsAbridged: boolean;
  trailer: Trailer | null;
  status?: string | null;
  budget?: number | null;
  revenue?: number | null;
  keywords: string[];
  /** Editorial line written by AFTERFRAME — never presented as a review. */
  editorialNote?: string;
  moods: MoodTag[];
  /** Related titles: TMDB recommendations in live mode, metadata similarity offline. */
  related: MovieSummary[];
  relatedSource: 'tmdb' | 'metadata';
}

/** Curated offline record. */
export interface LocalFilm {
  id: number;
  title: string;
  year: number;
  runtime: number;
  genres: string[];
  director: string;
  cast: string[];
  country: string;
  language: string;
  overview: string;
  note?: string;
  poster: string | null;
  backdrop: string | null;
  palette: [string, string];
  moods: MoodTag[];
  traits: Trait[];
  keywords?: string[];
  gem?: boolean;
}

export interface Collection {
  slug: string;
  number: string;
  title: string;
  /** Short line used on previews. */
  description: string;
  /** Longer editorial introduction for the detail page. */
  intro: string;
  filmIds: number[];
  coverFilmId: number;
  accent: string;
  /** Visual identity used by preview tiles. */
  variant: 'wide' | 'tall' | 'type' | 'split' | 'stack' | 'band';
}

export type SortKey = 'relevance' | 'newest' | 'oldest' | 'title' | 'rating';

export interface DiscoverParams {
  query: string;
  genre: string | null;
  decade: number | null;
  minRating: number | null;
  sort: SortKey;
  page: number;
}

export interface DiscoverResult {
  results: MovieSummary[];
  page: number;
  totalPages: number;
  /** Null when the source cannot report an exact total (e.g. filtered live search). */
  totalResults: number | null;
}

export type Feeling = 'wonder' | 'tension' | 'comfort' | 'melancholy' | 'excitement' | 'surprise';
export type TimeWindow = 'short' | 'standard' | 'long' | 'any';

export interface MoodPreferences {
  feeling: Feeling | null;
  time: TimeWindow;
  trait: Trait | null;
}

export interface Recommendation {
  film: MovieSummary;
  score: number;
  reasons: string[];
  /** True when the film satisfies every non-skipped preference. */
  exact: boolean;
}
