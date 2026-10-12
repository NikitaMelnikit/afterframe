import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { PosterTriptych } from '@/components/collections/PosterTriptych';
import { Backdrop } from '@/components/film/Backdrop';
import { FilmCard, FilmCardSkeleton } from '@/components/film/FilmCard';
import { Reveal } from '@/components/ui/Reveal';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { COLLECTIONS, getCollection } from '@/data/collections';
import { LOCAL_FILM_MAP } from '@/data/films';
import { repository } from '@/data/repository';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatRuntime, pluralize } from '@/lib/format';
import { EASE_SHUTTER } from '@/lib/motion';

export default function Collection() {
  const { slug = '' } = useParams();
  const collection = getCollection(slug);
  const reduce = useReducedMotion();
  useDocumentTitle(collection ? collection.title : 'Collection not found');
  const films = useAsync((signal) => (collection ? repository.getSummaries(collection.availableIds, signal) : Promise.resolve([])), [slug]);

  if (!collection) {
    return (
      <div className="frame pb-24 pt-[calc(var(--nav-h)+4rem)]">
        <EmptyState
          as="h1"
          eyebrow="404 — Unknown collection"
          title="That collection hasn’t been curated (yet)."
          actions={
            <Link to="/collections" viewTransition className="btn-primary">
              See all collections
            </Link>
          }
        />
      </div>
    );
  }

  const cover = LOCAL_FILM_MAP.get(collection.coverFilmId);
  const related = COLLECTIONS.filter((c) => c.slug !== collection.slug).slice(0, 3);
  const totalRuntime = collection.availableIds.reduce((sum, id) => sum + (LOCAL_FILM_MAP.get(id)?.runtime ?? 0), 0);

  return (
    <article aria-labelledby="collection-title">
      <header className="relative flex min-h-[88svh] items-end overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 1.2, ease: EASE_SHUTTER }}
        >
          <Backdrop title={collection.title} path={collection.coverKind === 'backdrop' ? collection.coverPath : null} posterPath={cover?.poster} palette={cover?.palette} priority />
          {collection.coverKind !== 'backdrop' && (
            <PosterTriptych ids={collection.availableIds} accent={collection.accent} sizes="(min-width:1024px) 16vw, 28vw" align="start" className="left-auto hidden w-[42%] pt-[15vh] lg:flex" />
          )}
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        <div aria-hidden className="vignette absolute inset-0" />
        <div className="frame relative z-10 w-full pb-14 pt-[calc(var(--nav-h)+3rem)] md:pb-20">
          <Link to="/collections" viewTransition className="group inline-flex min-h-[2.75rem] items-center gap-2 font-mono text-micro uppercase text-silver hover:text-ivory">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" aria-hidden /> All collections
          </Link>
          <p className="eyebrow mt-8 flex items-center gap-3">
            <span className="h-1.5 w-6" style={{ background: collection.accent }} aria-hidden />
            Collection {collection.number} / {String(COLLECTIONS.length).padStart(2, '0')}
          </p>
          <h1 id="collection-title" className="mt-5 font-display text-[clamp(3rem,11vw,11.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">
            {collection.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ivory/85">{collection.description}</p>
        </div>
      </header>

      <section className="frame grid-12 gap-y-8 py-20 md:py-28" aria-labelledby="intro-label">
        <div className="col-span-4 md:col-span-8 lg:col-span-3">
          <h2 id="intro-label" className="flex items-center gap-3 font-mono text-micro uppercase text-silver">
            <span className="text-acid">(01)</span> Introduction
          </h2>
          <dl className="mt-6 space-y-3 font-mono text-micro uppercase">
            <div className="flex gap-3">
              <dt className="text-silver">Films</dt>
              <dd>{collection.availableIds.length}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-silver">Running time</dt>
              <dd>{formatRuntime(totalRuntime)}</dd>
            </div>
          </dl>
        </div>
        <Reveal className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
          <p className="font-display text-[clamp(1.4rem,2.6vw,2.4rem)] font-medium leading-[1.15] tracking-[-0.025em] text-ivory/90">{collection.intro}</p>
        </Reveal>
      </section>

      <section className="frame pb-24" aria-labelledby="lineup-label">
        <h2 id="lineup-label" className="flex items-center gap-3 border-t border-line pt-6 font-mono text-micro uppercase text-silver">
          <span className="text-acid">(02)</span> The lineup — {pluralize(collection.availableIds.length, 'film')}
        </h2>
        {films.status === 'error' ? (
          <ErrorState error={films.error} onRetry={films.reload} />
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
            {films.data
              ? films.data.map((f, i) => (
                  <li key={f.id} className={i % 2 === 1 ? 'lg:translate-y-10' : undefined}>
                    <FilmCard film={f} index={i} showRuntime sizes="(min-width:1280px) 18vw, (min-width:1024px) 22vw, (min-width:640px) 30vw, 46vw" />
                  </li>
                ))
              : Array.from({ length: 8 }, (_, i) => (
                  <li key={i}>
                    <FilmCardSkeleton />
                  </li>
                ))}
          </ul>
        )}
      </section>

      <section className="border-t border-line bg-charcoal/40 py-20 md:py-28" aria-labelledby="related-label">
        <div className="frame">
          <h2 id="related-label" className="flex items-center gap-3 font-mono text-micro uppercase text-silver">
            <span className="text-acid">(03)</span> Keep going
          </h2>
          <ul className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
            {related.map((c) => (
              <li key={c.slug} className="bg-ink">
                <Link to={`/collections/${c.slug}`} viewTransition className="group flex h-full min-h-[14rem] flex-col justify-between gap-8 p-6 transition-colors hover:bg-charcoal md:p-8">
                  <span className="flex items-center justify-between font-mono text-micro text-silver">
                    C/{c.number}
                    <ArrowUpRight className="h-4 w-4 transition-colors group-hover:text-acid" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-display text-[clamp(1.8rem,3vw,2.75rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">{c.title}</span>
                    <span className="mt-3 block text-sm text-silver">{c.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
