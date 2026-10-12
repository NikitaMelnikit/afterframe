import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PosterTriptych } from '@/components/collections/PosterTriptych';
import { Backdrop } from '@/components/film/Backdrop';
import { Poster } from '@/components/film/Poster';
import { Reveal } from '@/components/ui/Reveal';
import { COLLECTIONS } from '@/data/collections';
import { LOCAL_FILM_MAP } from '@/data/films';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { pluralize } from '@/lib/format';

export default function Collections() {
  useDocumentTitle('Collections');
  const totalFilms = new Set(COLLECTIONS.flatMap((c) => c.availableIds)).size;

  return (
    <div className="pb-24 pt-[calc(var(--nav-h)+3rem)] md:pt-[calc(var(--nav-h)+5rem)]">
      <header className="frame grid-12 gap-y-8">
        <p className="eyebrow col-span-4 flex items-center gap-3 md:col-span-8 lg:col-span-12">
          <span className="text-acid">(C)</span> The library, curated
        </p>
        <h1 className="col-span-4 font-display text-[clamp(3rem,13vw,13rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em] md:col-span-8 lg:col-span-12">
          Collections
        </h1>
        <p className="col-span-4 max-w-xl text-lg leading-relaxed text-silver md:col-span-6 lg:col-span-5 lg:col-start-8">
          {COLLECTIONS.length} editorial lenses on cinema, spanning {totalFilms} films. Each one is a mood, an argument and a lineup — some stories refuse to stay on screen.
        </p>
      </header>

      <ol className="frame mt-20 md:mt-28">
        {COLLECTIONS.map((c, i) => {
          const cover = LOCAL_FILM_MAP.get(c.coverFilmId);
          const posters = c.availableIds.map((id) => LOCAL_FILM_MAP.get(id)!).filter((f) => f.poster).slice(0, 4);
          const flip = i % 2 === 1;
          return (
            <li key={c.slug} className="border-t border-line last:border-b">
              <Reveal>
                <Link to={`/collections/${c.slug}`} viewTransition className="group grid-12 items-center gap-y-6 py-10 md:py-14">
                  <span className="col-span-4 font-mono text-micro text-silver md:col-span-1">C/{c.number}</span>
                  <div className={cn('col-span-4 md:col-span-7 lg:col-span-6', flip && 'lg:order-2 lg:col-start-7')}>
                    <h2 className="font-display text-[clamp(2.4rem,6.4vw,6.25rem)] font-semibold uppercase leading-[0.86] tracking-[-0.05em] transition-colors duration-500 group-hover:text-acid">
                      {c.title}
                    </h2>
                    <p className="mt-4 max-w-md text-silver">{c.description}</p>
                    <div className="mt-6 flex items-center gap-6">
                      <div className="flex -space-x-3" aria-hidden>
                        {posters.map((f) => (
                          <div key={f.id} className="w-10 ring-2 ring-ink md:w-12">
                            <Poster title={f.title} path={f.poster} palette={f.palette} sizes="48px" />
                          </div>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 font-mono text-micro uppercase text-ivory">
                        {pluralize(c.availableIds.length, 'film')} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </div>
                  <div className={cn('relative col-span-4 overflow-hidden md:col-span-8 lg:col-span-5', flip ? 'lg:order-1 lg:col-span-5 lg:col-start-2' : 'lg:col-start-8', i % 3 === 1 ? 'aspect-[4/3]' : 'aspect-[16/9]')}>
                    <div className="absolute inset-0 transition-transform duration-[1200ms] ease-cinema group-hover:scale-[1.05]">
                      {c.coverKind === 'backdrop' ? (
                        <Backdrop title={c.title} path={c.coverPath} posterPath={cover?.poster} palette={cover?.palette} sizes="(min-width:1024px) 40vw, 100vw" />
                      ) : (
                        <PosterTriptych ids={c.availableIds} accent={c.accent} sizes="(min-width:1024px) 12vw, 28vw" />
                      )}
                    </div>
                    <span aria-hidden className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-700 ease-cinema group-hover:w-full" style={{ background: c.accent }} />
                  </div>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
