import { LOCAL_FILM_MAP } from '../films';
import { GENRE_IDS, TMDB_GENRES } from '../genres';
import { FEELINGS, TIME_OPTIONS } from '../moods';
import { tmdb, TmdbError, type TmdbDetail, type TmdbListItem, type TmdbPage } from '../tmdb';
import type { DiscoverParams, DiscoverResult, MovieDetail, MovieSummary, Recommendation, Trailer } from '../types';
import { localRepository } from './local';
import type { MovieRepository } from './types';

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

function yearOf(date?: string | null) {
  const y = date ? Number(date.slice(0, 4)) : NaN;
  return Number.isFinite(y) && y > 1800 ? y : null;
}

export function mapListItem(m: TmdbListItem): MovieSummary {
  const local = LOCAL_FILM_MAP.get(m.id);
  return {
    id: m.id,
    title: m.title || m.original_title || 'Untitled',
    year: yearOf(m.release_date),
    releaseDate: m.release_date || null,
    genres: (m.genre_ids ?? []).map((g) => TMDB_GENRES[g]).filter(Boolean),
    posterPath: m.poster_path ?? null,
    backdropPath: m.backdrop_path ?? null,
    overview: m.overview || undefined,
    rating: m.vote_count ? m.vote_average ?? null : null,
    voteCount: m.vote_count ?? null,
    popularity: m.popularity ?? null,
    palette: local?.palette,
    source: 'live',
  };
}

function pickTrailer(d: TmdbDetail): Trailer | null {
  const vids = (d.videos?.results ?? []).filter((v) => v.site === 'YouTube' && v.key);
  const ranked = [
    vids.find((v) => v.type === 'Trailer' && v.official),
    vids.find((v) => v.type === 'Trailer'),
    vids.find((v) => v.type === 'Teaser' && v.official),
  ].find(Boolean);
  return ranked ? { key: ranked.key, name: ranked.name, site: 'YouTube', official: ranked.official } : null;
}

function mapDetail(d: TmdbDetail): MovieDetail {
  const local = LOCAL_FILM_MAP.get(d.id);
  const crew = d.credits?.crew ?? [];
  const related = (d.recommendations?.results?.length ? d.recommendations.results : d.similar?.results ?? [])
    .filter((m) => m.id !== d.id)
    .slice(0, 12)
    .map(mapListItem);
  return {
    id: d.id,
    title: d.title || d.original_title || 'Untitled',
    year: yearOf(d.release_date),
    releaseDate: d.release_date || null,
    genres: d.genres?.map((g) => g.name) ?? [],
    posterPath: d.poster_path ?? null,
    backdropPath: d.backdrop_path ?? null,
    overview: d.overview || undefined,
    runtime: d.runtime || null,
    rating: d.vote_count ? d.vote_average ?? null : null,
    voteCount: d.vote_count ?? null,
    popularity: d.popularity ?? null,
    palette: local?.palette,
    source: 'live',
    tagline: d.tagline || null,
    originalTitle: d.original_title && d.original_title !== d.title ? d.original_title : null,
    originalLanguage: d.original_language || null,
    countries: d.production_countries?.map((c) => c.name) ?? [],
    languages: d.spoken_languages?.map((l) => l.english_name || l.name).filter(Boolean) ?? [],
    directors: crew.filter((c) => c.job === 'Director').map((c) => c.name),
    writers: [...new Set(crew.filter((c) => ['Screenplay', 'Writer', 'Story', 'Novel'].includes(c.job)).map((c) => c.name))],
    cast: (d.credits?.cast ?? [])
      .sort((a, b) => a.order - b.order)
      .slice(0, 12)
      .map((c) => ({ id: c.id, name: c.name, character: c.character, profilePath: c.profile_path })),
    crew: crew
      .filter((c) => ['Director', 'Screenplay', 'Writer', 'Director of Photography', 'Original Music Composer', 'Editor', 'Producer'].includes(c.job))
      .slice(0, 12)
      .map((c) => ({ id: c.id, name: c.name, job: c.job })),
    creditsAbridged: false,
    trailer: pickTrailer(d),
    status: d.status || null,
    budget: d.budget || null,
    revenue: d.revenue || null,
    keywords: d.keywords?.keywords?.map((k) => k.name).slice(0, 12) ?? [],
    editorialNote: local?.note,
    moods: local?.moods ?? [],
    related,
    relatedSource: 'tmdb',
  };
}

const SORT_MAP: Record<string, { sort_by: string; extra?: Record<string, number> }> = {
  relevance: { sort_by: 'popularity.desc' },
  newest: { sort_by: 'primary_release_date.desc', extra: { 'vote_count.gte': 50 } },
  oldest: { sort_by: 'primary_release_date.asc', extra: { 'vote_count.gte': 50 } },
  title: { sort_by: 'title.asc', extra: { 'vote_count.gte': 100 } },
  rating: { sort_by: 'vote_average.desc', extra: { 'vote_count.gte': 300 } },
};

function sortClientSide(rows: MovieSummary[], sort: DiscoverParams['sort']) {
  const copy = [...rows];
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''));
    case 'oldest':
      return copy.sort((a, b) => (a.releaseDate || '9999').localeCompare(b.releaseDate || '9999'));
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
    case 'rating':
      return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    default:
      return copy;
  }
}

async function liveDiscover(params: DiscoverParams, signal?: AbortSignal): Promise<DiscoverResult> {
  const today = new Date().toISOString().slice(0, 10);
  const q = params.query.trim();

  if (q) {
    // /search/movie cannot filter by genre or decade, so those filters are applied to each page client-side.
    const data = await tmdb<TmdbPage<TmdbListItem>>('/search/movie', { query: q, page: params.page, include_adult: false }, signal);
    let rows = data.results.map(mapListItem);
    const filtered = Boolean(params.genre || params.decade || params.minRating);
    if (params.genre) rows = rows.filter((r) => r.genres.includes(params.genre!));
    if (params.decade) rows = rows.filter((r) => r.year != null && r.year >= params.decade! && r.year < params.decade! + 10);
    if (params.minRating) rows = rows.filter((r) => (r.rating ?? 0) >= params.minRating!);
    return {
      results: sortClientSide(rows, params.sort),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: filtered ? null : data.total_results,
    };
  }

  const sort = SORT_MAP[params.sort] ?? SORT_MAP.relevance;
  const data = await tmdb<TmdbPage<TmdbListItem>>(
    '/discover/movie',
    {
      include_adult: false,
      include_video: false,
      page: params.page,
      sort_by: sort.sort_by,
      with_genres: params.genre ? GENRE_IDS[params.genre] : undefined,
      'primary_release_date.gte': params.decade ? `${params.decade}-01-01` : undefined,
      'primary_release_date.lte': params.decade ? `${params.decade + 9}-12-31` : today,
      'vote_average.gte': params.minRating ?? undefined,
      'vote_count.gte': params.minRating ? Math.max(100, sort.extra?.['vote_count.gte'] ?? 0) : sort.extra?.['vote_count.gte'],
    },
    signal,
  );
  return {
    results: data.results.map(mapListItem),
    page: data.page,
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
  };
}

export function createLiveRepository(): MovieRepository {
  return {
    mode: 'live',
    hasRatings: true,

    async getMovie(id, signal) {
      try {
        const d = await tmdb<TmdbDetail>(`/movie/${id}`, { append_to_response: 'credits,videos,recommendations,similar,keywords' }, signal);
        return mapDetail(d);
      } catch (e) {
        if (isAbort(e)) throw e;
        if (e instanceof TmdbError && e.status === 404) return localRepository.getMovie(id);
        // Network or auth failure: fall back to the offline record when we have one.
        const local = await localRepository.getMovie(id);
        if (local) return local;
        throw e;
      }
    },

    async getSummaries(ids, signal) {
      // Curated lists come from the editorial library; live data only fills in missing artwork.
      const base = await localRepository.getSummaries(ids);
      return Promise.all(
        base.map(async (s) => {
          if (s.posterPath) return s;
          try {
            const d = await tmdb<TmdbListItem>(`/movie/${s.id}`, {}, signal);
            return { ...s, posterPath: d.poster_path ?? null, backdropPath: s.backdropPath ?? d.backdrop_path ?? null };
          } catch {
            return s;
          }
        }),
      );
    },

    async search(query, signal) {
      const data = await tmdb<TmdbPage<TmdbListItem>>('/search/movie', { query, include_adult: false, page: 1 }, signal);
      return data.results.slice(0, 8).map(mapListItem);
    },

    discover: liveDiscover,

    async recommend(prefs, signal) {
      const curated = await localRepository.recommend(prefs);
      const feeling = FEELINGS.find((f) => f.id === prefs.feeling);
      const time = TIME_OPTIONS.find((t) => t.id === prefs.time);
      const traitParams: Record<string, { sort_by: string; min: number; max?: number }> = {
        familiar: { sort_by: 'vote_count.desc', min: 3000 },
        unusual: { sort_by: 'vote_average.desc', min: 150, max: 2500 },
        visual: { sort_by: 'vote_average.desc', min: 1000 },
        intense: { sort_by: 'vote_average.desc', min: 800 },
        easy: { sort_by: 'popularity.desc', min: 500 },
      };
      const tp = prefs.trait ? traitParams[prefs.trait] : { sort_by: 'vote_average.desc', min: 600 };
      try {
        const data = await tmdb<TmdbPage<TmdbListItem>>(
          '/discover/movie',
          {
            include_adult: false,
            sort_by: tp.sort_by,
            'vote_count.gte': tp.min,
            'vote_count.lte': tp.max,
            with_genres: feeling ? feeling.genres.map((g) => GENRE_IDS[g]).join('|') : undefined,
            'with_runtime.gte': time?.min,
            'with_runtime.lte': prefs.time === 'short' && !time?.max ? 109 : time?.max,
            'primary_release_date.lte': new Date().toISOString().slice(0, 10),
          },
          signal,
        );
        const curatedIds = new Set(curated.curated.map((c) => c.film.id));
        const catalogue: Recommendation[] = data.results
          .filter((m) => !curatedIds.has(m.id) && m.poster_path)
          .slice(0, 8)
          .map((m) => {
            const film = mapListItem(m);
            const reasons: string[] = [];
            const hits = feeling ? film.genres.filter((g) => feeling.genres.includes(g)) : [];
            if (hits.length) reasons.push(`${hits.join(' & ')} — in step with ${feeling!.label.toLowerCase()}`);
            if (time && prefs.time !== 'any') reasons.push('Within your runtime window (TMDB runtime filter)');
            if (film.rating != null && film.voteCount) reasons.push(`Rated ${film.rating.toFixed(1)}/10 across ${film.voteCount.toLocaleString('en')} TMDB votes`);
            return { film, score: 0, reasons, exact: true };
          });
        return { curated: curated.curated, catalogue };
      } catch (e) {
        if (isAbort(e)) throw e;
        return curated;
      }
    },
  };
}

