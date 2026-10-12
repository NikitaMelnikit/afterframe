import { TMDB_ENABLED } from '../tmdb';
import { createLiveRepository } from './live';
import { localRepository } from './local';
import type { MovieRepository } from './types';

/**
 * The app-wide data source. Switching between live TMDB data and the curated
 * offline edition happens here, and only here.
 */
export const repository: MovieRepository = TMDB_ENABLED ? createLiveRepository() : localRepository;

export type { MovieRepository, RecommendationSet } from './types';
export { PAGE_SIZE } from './local';
