import type {
  DataSource,
  DiscoverParams,
  DiscoverResult,
  MoodPreferences,
  MovieDetail,
  MovieSummary,
  Recommendation,
} from '../types';

export interface RecommendationSet {
  /** Editorially tagged matches from the AFTERFRAME library. */
  curated: Recommendation[];
  /** Extra matches from the wider TMDB catalogue (live mode only). */
  catalogue: Recommendation[];
}

/**
 * The single contract page components depend on. Implementations:
 * - `localRepository`: curated offline edition, no network required.
 * - `createLiveRepository()`: TMDB-backed, falling back to local data where sensible.
 */
export interface MovieRepository {
  readonly mode: DataSource;
  /** Whether verified ratings exist (TMDB only). */
  readonly hasRatings: boolean;
  getMovie(id: number, signal?: AbortSignal): Promise<MovieDetail | null>;
  getSummaries(ids: number[], signal?: AbortSignal): Promise<MovieSummary[]>;
  search(query: string, signal?: AbortSignal): Promise<MovieSummary[]>;
  discover(params: DiscoverParams, signal?: AbortSignal): Promise<DiscoverResult>;
  recommend(prefs: MoodPreferences, signal?: AbortSignal): Promise<RecommendationSet>;
}
