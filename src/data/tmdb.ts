/**
 * Minimal, typed TMDB v3 client.
 * Docs: https://developer.themoviedb.org/reference/intro/getting-started
 *
 * - Accepts either a v3 API key or a v4 read-access token from env.
 * - Caches successful GET responses in memory (bounded) and de-duplicates
 *   identical in-flight requests that are not tied to an AbortSignal.
 */
const API_BASE = 'https://api.themoviedb.org/3';
const API_KEY = (import.meta.env.VITE_TMDB_API_KEY as string | undefined)?.trim();
const READ_TOKEN = (import.meta.env.VITE_TMDB_READ_TOKEN as string | undefined)?.trim();

export const TMDB_ENABLED = Boolean(API_KEY || READ_TOKEN);

export class TmdbError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

const MAX_CACHE = 300;
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

type Params = Record<string, string | number | boolean | null | undefined>;

export async function tmdb<T>(path: string, params: Params = {}, signal?: AbortSignal): Promise<T> {
  const url = new URL(API_BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  url.searchParams.set('language', 'en-US');
  if (API_KEY && !READ_TOKEN) url.searchParams.set('api_key', API_KEY);
  const key = url.toString();

  if (cache.has(key)) return cache.get(key) as T;
  if (!signal && inflight.has(key)) return inflight.get(key) as Promise<T>;

  const request = fetch(key, {
    signal,
    headers: {
      accept: 'application/json',
      ...(READ_TOKEN ? { Authorization: `Bearer ${READ_TOKEN}` } : {}),
    },
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { status_message?: string } | null;
        throw new TmdbError(res.status, body?.status_message ?? `TMDB request failed (${res.status})`);
      }
      return res.json() as Promise<T>;
    })
    .then((data) => {
      cache.set(key, data);
      if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value as string);
      return data;
    })
    .finally(() => inflight.delete(key));

  if (!signal) inflight.set(key, request);
  return request;
}

/* ---------- Response shapes (only the fields we use) ---------- */

export interface TmdbListItem {
  id: number;
  title: string;
  original_title?: string;
  release_date?: string;
  genre_ids?: number[];
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
}

export interface TmdbPage<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbVideo {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at?: string;
}

export interface TmdbDetail extends Omit<TmdbListItem, 'genre_ids'> {
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string | null;
  original_language: string;
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { english_name: string; name: string }[];
  status: string;
  budget: number;
  revenue: number;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
    crew: { id: number; name: string; job: string; department: string }[];
  };
  videos?: { results: TmdbVideo[] };
  recommendations?: TmdbPage<TmdbListItem>;
  similar?: TmdbPage<TmdbListItem>;
  keywords?: { keywords: { id: number; name: string }[] };
}
