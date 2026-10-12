import { EDITORIAL_RANK, LOCAL_FILM_MAP, LOCAL_FILMS } from '../films';
import { recommendLocal, similarLocal } from '../matching';
import type { DiscoverParams, DiscoverResult, LocalFilm, MovieDetail, MovieSummary } from '../types';
import type { MovieRepository } from './types';

export const PAGE_SIZE = 20;

export function toSummary(f: LocalFilm): MovieSummary {
  return {
    id: f.id,
    title: f.title,
    year: f.year,
    releaseDate: null,
    genres: f.genres,
    posterPath: f.poster,
    backdropPath: f.backdrop,
    overview: f.overview,
    runtime: f.runtime,
    rating: null,
    palette: f.palette,
    source: 'offline',
  };
}

export function toDetail(f: LocalFilm): MovieDetail {
  return {
    ...toSummary(f),
    tagline: null,
    originalTitle: null,
    originalLanguage: f.language,
    countries: [f.country],
    languages: [f.language],
    directors: [f.director],
    writers: [],
    cast: f.cast.map((name) => ({ name })),
    crew: [{ name: f.director, job: 'Director' }],
    creditsAbridged: true,
    trailer: null,
    status: null,
    budget: null,
    revenue: null,
    keywords: f.keywords ?? [],
    editorialNote: f.note,
    moods: f.moods,
    related: similarLocal(f).map(toSummary),
    relatedSource: 'metadata',
  };
}

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ranks how well a film matches a free-text query. 0 means no match. */
function matchScore(f: LocalFilm, query: string) {
  const q = normalize(query);
  if (!q) return 0;
  const title = normalize(f.title);
  if (title === q) return 100;
  if (title.startsWith(q)) return 85;
  if (title.includes(q)) return 70;
  const director = normalize(f.director);
  const cast = f.cast.map(normalize);
  if (director.includes(q)) return 55;
  if (cast.some((c) => c.includes(q))) return 50;
  if (String(f.year) === q) return 40;
  if (f.genres.some((g) => normalize(g) === q)) return 35;
  if ((f.keywords ?? []).some((k) => normalize(k).includes(q))) return 25;
  // Every token present somewhere in the record.
  const hay = [title, director, ...cast, ...f.genres.map(normalize), ...(f.keywords ?? []).map(normalize), String(f.year)].join(' ');
  const tokens = q.split(' ').filter(Boolean);
  if (tokens.length > 1 && tokens.every((t) => hay.includes(t))) return 20;
  return 0;
}

function byRank(a: LocalFilm, b: LocalFilm) {
  return (EDITORIAL_RANK.get(a.id) ?? 0) - (EDITORIAL_RANK.get(b.id) ?? 0);
}

export function localSearch(query: string, limit = 8) {
  return LOCAL_FILMS.map((f) => ({ f, s: matchScore(f, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || byRank(a.f, b.f))
    .slice(0, limit)
    .map((x) => toSummary(x.f));
}

export function localDiscover(params: DiscoverParams): DiscoverResult {
  const q = params.query.trim();
  let rows = LOCAL_FILMS.map((f) => ({ f, s: q ? matchScore(f, q) : 1 })).filter((x) => x.s > 0);
  if (params.genre) rows = rows.filter((x) => x.f.genres.includes(params.genre!));
  if (params.decade) rows = rows.filter((x) => x.f.year >= params.decade! && x.f.year < params.decade! + 10);

  rows.sort((a, b) => {
    switch (params.sort) {
      case 'newest':
        return b.f.year - a.f.year || byRank(a.f, b.f);
      case 'oldest':
        return a.f.year - b.f.year || byRank(a.f, b.f);
      case 'title':
        return a.f.title.localeCompare(b.f.title, 'en', { sensitivity: 'base' });
      default:
        // Relevance: query match strength, then editorial order.
        return b.s - a.s || byRank(a.f, b.f);
    }
  });

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(params.page, totalPages);
  return {
    results: rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((x) => toSummary(x.f)),
    page,
    totalPages,
    totalResults: total,
  };
}

export const localRepository: MovieRepository = {
  mode: 'offline',
  hasRatings: false,
  async getMovie(id) {
    const f = LOCAL_FILM_MAP.get(id);
    return f ? toDetail(f) : null;
  },
  async getSummaries(ids) {
    return ids.map((id) => LOCAL_FILM_MAP.get(id)).filter((f): f is LocalFilm => Boolean(f)).map(toSummary);
  },
  async search(query) {
    return localSearch(query);
  },
  async discover(params) {
    return localDiscover(params);
  },
  async recommend(prefs) {
    return {
      curated: recommendLocal(prefs).map((m) => ({ film: toSummary(m.film), score: m.score, reasons: m.reasons, exact: m.exact })),
      catalogue: [],
    };
  },
};
