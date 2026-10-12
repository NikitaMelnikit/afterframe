import { ArrowLeft, ArrowUpRight, Play, Star } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Backdrop } from '@/components/film/Backdrop';
import { FilmRail } from '@/components/film/FilmRail';
import { Poster } from '@/components/film/Poster';
import { TrailerModal } from '@/components/film/TrailerModal';
import { WatchlistButton } from '@/components/film/WatchlistButton';
import { Reveal } from '@/components/ui/Reveal';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { collectionsForFilm } from '@/data/collections';
import { tmdbImage } from '@/data/images';
import { MOOD_TAG_LABELS } from '@/data/moods';
import { repository } from '@/data/repository';
import type { MovieDetail, MovieSummary } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate, formatMoney, formatRating, formatRuntime, joinList, languageName, pluralize } from '@/lib/format';

export default function Film() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const valid = Number.isInteger(id) && id > 0;
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { film?: MovieSummary; surprise?: boolean } | null;
  // Render immediately from the card that was clicked; hydrate when full details arrive.
  const preview = state?.film?.id === id ? state.film : undefined;

  const req = useAsync<MovieDetail | null>((signal) => (valid ? repository.getMovie(id, signal) : Promise.resolve(null)), [id]);
  const detail = req.data && req.data.id === id ? req.data : undefined;
  const film: MovieSummary | undefined = detail ?? preview;
  const notFound = !valid || (req.status === 'success' && !req.data);
  const [trailerOpen, setTrailerOpen] = useState(false);

  useDocumentTitle(notFound ? 'Film not found' : film?.title);

  if (notFound) {
    return (
      <div className="frame pb-24 pt-[calc(var(--nav-h)+4rem)]">
        <EmptyState
          as="h1"
          eyebrow="404 — Missing reel"
          title="This reel is missing."
          body={`We couldn’t find that film${repository.mode === 'offline' ? ' in the offline edition. Connect TMDB to open any title in its catalogue' : ''}.`}
          actions={
            <>
              <Link to="/discover" viewTransition className="btn-primary">
                Explore films
              </Link>
              <Link to="/mood" viewTransition className="btn-ghost">
                Find by mood
              </Link>
            </>
          }
        />
      </div>
    );
  }

  if (!film) {
    if (req.status === 'error') {
      return (
        <div className="frame pb-24 pt-[calc(var(--nav-h)+4rem)]">
          <ErrorState error={req.error} onRetry={req.reload} />
        </div>
      );
    }
    return <HeroSkeleton />;
  }

  const back = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/discover', { viewTransition: true });
  };

  const meta = [film.year, formatRuntime(detail?.runtime ?? film.runtime), film.genres.slice(0, 3).join(' / ')].filter(Boolean);

  return (
    <article aria-labelledby="film-title">
      {/* ---------- Hero ---------- */}
      <header className="relative flex min-h-[94svh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <Backdrop key={film.id} title={film.title} path={film.backdropPath} posterPath={film.posterPath} palette={film.palette} priority focus="50% 30%" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent" />
        <div aria-hidden className="vignette absolute inset-0" />

        <div className="frame relative z-10 w-full pb-12 pt-[calc(var(--nav-h)+2rem)] md:pb-20">
          <button type="button" onClick={back} className="group inline-flex min-h-[2.75rem] items-center gap-2 font-mono text-micro uppercase text-silver hover:text-ivory">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" aria-hidden /> Back
          </button>
          {state?.surprise && <p className="eyebrow mt-2 text-acid">Picked at random from the library — no regrets.</p>}

          <div className="grid-12 mt-8 items-end gap-y-8 md:mt-14">
            <div className="col-span-2 md:col-span-3">
              <Poster
                key={film.id}
                title={film.title}
                year={film.year}
                path={film.posterPath}
                palette={film.palette}
                priority
                alt={`Poster for ${film.title}`}
                sizes="(min-width:1024px) 22vw, 40vw"
                className="shadow-2xl shadow-black/60"
                shared
              />
            </div>
            <div className="col-span-4 md:col-span-5 lg:col-span-8 lg:col-start-5">
              <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
                {detail?.directors.length ? <span>Dir. {joinList(detail.directors, 2)}</span> : <span>Film</span>}
                {detail?.originalTitle && <span className="normal-case tracking-normal text-ivory/60">{detail.originalTitle}</span>}
              </p>
              <h1 id="film-title" className="mt-4 font-display text-[clamp(2.5rem,7.2vw,7.5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.05em]">
                {film.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-[0.78rem] uppercase tracking-[0.1em] text-ivory/80">
                <span>
                  {meta.map((m, i) => (
                    <span key={i} className="whitespace-nowrap">
                      {i > 0 && (
                        <span className="px-2.5 text-silver" aria-hidden>
                          ·
                        </span>
                      )}
                      {m}
                      {i < meta.length - 1 && ' '}
                    </span>
                  ))}
                </span>
                {detail?.rating != null && repository.hasRatings && (
                  <span className="inline-flex items-center gap-2 border border-line-strong px-2.5 py-1 text-ivory" title="TMDB user score">
                    <Star className="h-3.5 w-3.5 fill-acid text-acid" aria-hidden />
                    {formatRating(detail.rating)}
                    <span className="text-silver">/ 10 · TMDB · {detail.voteCount?.toLocaleString('en')} votes</span>
                  </span>
                )}
              </div>
              {detail?.tagline && <p className="mt-6 font-display text-xl italic text-ivory/80">{detail.tagline}</p>}
              {film.overview && <p className="mt-5 line-clamp-5 max-w-2xl text-[1.02rem] leading-relaxed text-ivory/85">{film.overview}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => setTrailerOpen(true)} className="btn-primary" disabled={!detail}>
                  <Play className="h-4 w-4 fill-current" aria-hidden /> Watch trailer
                </button>
                <WatchlistButton film={film} variant="full" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {detail ? <FilmBody detail={detail} /> : req.status === 'error' ? <div className="frame py-16"><ErrorState error={req.error} onRetry={req.reload} /></div> : <BodySkeleton />}

      {detail && <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} title={detail.title} year={detail.year} trailer={detail.trailer} live={detail.source === 'live'} />}
    </article>
  );
}

function SectionLabel({ n, children, id }: { n: string; children: ReactNode; id: string }) {
  return (
    <div className="col-span-4 md:col-span-8 lg:col-span-3">
      <h2 id={id} className="flex items-center gap-3 font-mono text-micro uppercase text-silver">
        <span className="text-acid">({n})</span> {children}
      </h2>
    </div>
  );
}

function FilmBody({ detail }: { detail: MovieDetail }) {
  const collections = collectionsForFilm(detail.id);
  const pull = detail.editorialNote ?? detail.tagline;
  const facts = [
    { label: 'Release', value: formatDate(detail.releaseDate) ?? (detail.year ? String(detail.year) : null) },
    { label: 'Runtime', value: formatRuntime(detail.runtime) },
    { label: 'Genres', value: detail.genres.join(', ') || null },
    { label: 'Directed by', value: detail.directors.join(', ') || null },
    { label: 'Written by', value: detail.writers.length ? joinList(detail.writers, 4) : null },
    { label: 'Original language', value: languageName(detail.originalLanguage) ?? detail.languages[0] ?? null },
    { label: 'Spoken languages', value: detail.languages.length > 1 ? detail.languages.join(', ') : null },
    { label: 'Countries', value: detail.countries.join(', ') || null },
    { label: 'Status', value: detail.status },
    { label: 'Budget', value: formatMoney(detail.budget) },
    { label: 'Box office', value: formatMoney(detail.revenue) },
    { label: 'Data source', value: detail.source === 'live' ? 'TMDB (live)' : 'AFTERFRAME offline edition' },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <div className="frame space-y-24 py-20 md:space-y-36 md:py-32">
      {/* 01 — Overview */}
      <section aria-labelledby="s-overview" className="grid-12 gap-y-8">
        <SectionLabel n="01" id="s-overview">
          Film overview
        </SectionLabel>
        <div className="col-span-4 md:col-span-8 lg:col-span-9">
          {pull && (
            <Reveal>
              <p className="max-w-4xl font-display text-[clamp(1.6rem,3.6vw,3.2rem)] font-medium leading-[1.05] tracking-[-0.03em]">
                {detail.editorialNote ? (
                  <>
                    <span className="text-silver">Editor’s note — </span>
                    {detail.editorialNote}
                  </>
                ) : (
                  detail.tagline
                )}
              </p>
            </Reveal>
          )}
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {detail.overview && (
              <div>
                <h3 className="eyebrow mb-3">The premise</h3>
                <p className="text-[1.02rem] leading-relaxed text-ivory/85">{detail.overview}</p>
              </div>
            )}
            <div className="space-y-8">
              {detail.moods.length > 0 && (
                <div>
                  <h3 className="eyebrow mb-3">AFTERFRAME mood tags</h3>
                  <ul className="flex flex-wrap gap-2">
                    {detail.moods.map((m) => (
                      <li key={m} className="chip pointer-events-none">
                        {MOOD_TAG_LABELS[m]}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-silver">Editorial tags used by the Mood Finder — opinions, not ratings.</p>
                </div>
              )}
              {detail.keywords.length > 0 && (
                <div>
                  <h3 className="eyebrow mb-3">Keywords</h3>
                  <p className="text-sm leading-relaxed text-silver">{detail.keywords.join(' · ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 02 — Cast & crew */}
      <section aria-labelledby="s-cast" className="grid-12 gap-y-8">
        <SectionLabel n="02" id="s-cast">
          Cast & crew
        </SectionLabel>
        <div className="col-span-4 md:col-span-8 lg:col-span-9">
          {detail.cast.length === 0 && detail.crew.length === 0 ? (
            <p className="text-silver">Credits aren’t available for this film.</p>
          ) : detail.creditsAbridged ? (
            <div>
              <p className="eyebrow">Directed by</p>
              <p className="mt-2 font-display text-[clamp(1.8rem,4vw,3.5rem)] font-semibold uppercase leading-none tracking-[-0.04em]">{detail.directors.join(', ')}</p>
              <p className="eyebrow mt-10">Principal cast</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {detail.cast.map((c) => (
                  <li key={c.name} className="py-3 font-display text-xl tracking-tight md:text-2xl">
                    {c.name}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-silver">Offline edition: credits abridged to director and principal cast. Full cast and crew load with TMDB data.</p>
            </div>
          ) : (
            <div>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                {detail.cast.map((c) => (
                  <li key={`${c.id}-${c.character}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-charcoal">
                      {c.profilePath ? (
                        <img src={tmdbImage(c.profilePath, 'w185')!} alt="" loading="lazy" className="h-full w-full object-cover grayscale-[30%]" />
                      ) : (
                        <span aria-hidden className="grid h-full w-full place-items-center font-display text-3xl text-silver">
                          {c.name
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-medium leading-tight">{c.name}</p>
                    {c.character && <p className="mt-1 text-xs leading-snug text-silver">{c.character}</p>}
                  </li>
                ))}
              </ul>
              {detail.crew.length > 0 && (
                <dl className="mt-12 grid gap-x-8 gap-y-5 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-3">
                  {detail.crew.map((c) => (
                    <div key={`${c.id}-${c.job}`}>
                      <dt className="eyebrow">{c.job}</dt>
                      <dd className="mt-1">{c.name}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 03 — Facts */}
      <section aria-labelledby="s-facts" className="grid-12 gap-y-8">
        <SectionLabel n="03" id="s-facts">
          Film facts
        </SectionLabel>
        <dl className="col-span-4 divide-y divide-line border-y border-line md:col-span-8 lg:col-span-9">
          {facts.map((f) => (
            <div key={f.label} className="grid grid-cols-[minmax(0,10rem)_1fr] gap-4 py-4 md:grid-cols-[14rem_1fr]">
              <dt className="font-mono text-micro uppercase text-silver">{f.label}</dt>
              <dd className="text-sm text-ivory/90">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 04 — Similar films */}
      {detail.related.length > 0 && (
        <section aria-labelledby="s-similar">
          <div className="grid-12 gap-y-4">
            <SectionLabel n="04" id="s-similar">
              Similar films
            </SectionLabel>
            <p className="col-span-4 text-sm text-silver md:col-span-8 lg:col-span-9">
              {detail.relatedSource === 'tmdb' ? 'Recommendations from TMDB.' : 'Matched on shared genres, editorial mood tags and director.'}
            </p>
          </div>
          <div className="-mx-gutter mt-20">
            <FilmRail films={detail.related} label={`Films similar to ${detail.title}`} uniform />
          </div>
        </section>
      )}

      {/* 05 — Contextual collections */}
      {collections.length > 0 && (
        <section aria-labelledby="s-collections" className="grid-12 gap-y-8">
          <SectionLabel n="05" id="s-collections">
            Part of
          </SectionLabel>
          <ul className="col-span-4 grid gap-4 md:col-span-8 md:grid-cols-2 lg:col-span-9">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link to={`/collections/${c.slug}`} viewTransition className="group relative flex h-full min-h-[220px] flex-col justify-end overflow-hidden border border-line p-6">
                  <div className="absolute inset-0 opacity-50 transition-all duration-700 ease-cinema group-hover:scale-105 group-hover:opacity-70">
                    <Backdrop title={c.title} path={c.coverKind === 'backdrop' ? c.coverPath : null} posterPath={c.coverKind === 'poster' ? c.coverPath : null} sizes="50vw" />
                  </div>
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
                  <div className="relative">
                    <span className="font-mono text-micro text-acid">C/{c.number}</span>
                    <h3 className="mt-2 font-display text-3xl font-semibold uppercase leading-none tracking-[-0.04em]">{c.title}</h3>
                    <p className="mt-2 text-sm text-silver">{c.description}</p>
                    <p className="mt-4 inline-flex items-center gap-1 font-mono text-micro uppercase text-ivory group-hover:text-acid">
                      {pluralize(c.availableIds.length, 'film')} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="frame flex min-h-[94svh] items-end pb-20 pt-[calc(var(--nav-h)+4rem)]" aria-busy="true" aria-label="Loading film">
      <div className="grid-12 w-full items-end gap-y-8">
        <div className="skeleton col-span-2 aspect-poster md:col-span-3" />
        <div className="col-span-4 space-y-4 md:col-span-5 lg:col-span-8 lg:col-start-5">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-20 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-24 w-full max-w-2xl" />
        </div>
      </div>
    </div>
  );
}

function BodySkeleton() {
  return (
    <div className="frame space-y-6 py-24" aria-hidden>
      <div className="skeleton h-10 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-4 w-2/5" />
    </div>
  );
}
