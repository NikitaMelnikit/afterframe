import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ResolvedCollection } from '@/data/collections';
import { LOCAL_FILM_MAP } from '@/data/films';
import { tmdbImage } from '@/data/images';
import { cn } from '@/lib/cn';
import { pluralize } from '@/lib/format';
import { Backdrop } from '../film/Backdrop';
import { Poster } from '../film/Poster';

const SPAN: Record<ResolvedCollection['variant'], string> = {
  wide: 'md:col-span-8 lg:col-span-8',
  tall: 'md:col-span-8 lg:col-span-4',
  split: 'md:col-span-8 lg:col-span-6',
  type: 'md:col-span-8 lg:col-span-6',
  stack: 'md:col-span-8 lg:col-span-5',
  band: 'md:col-span-8 lg:col-span-7',
};

function posters(c: ResolvedCollection, n: number) {
  return c.availableIds
    .map((id) => LOCAL_FILM_MAP.get(id)!)
    .filter((f) => f.poster)
    .slice(0, n);
}

function Meta({ c, light }: { c: ResolvedCollection; light?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 font-mono text-micro uppercase">
      <span className={light ? 'text-ivory/70' : 'text-silver'}>
        C/{c.number} · {pluralize(c.availableIds.length, 'film')}
      </span>
      <span className="inline-flex items-center gap-1 text-ivory transition-colors group-hover:text-acid">
        Open <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 ease-cinema group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </span>
    </div>
  );
}

function Title({ c, className }: { c: ResolvedCollection; className?: string }) {
  return <h3 className={cn('font-display font-semibold uppercase leading-[0.9] tracking-[-0.04em]', className)}>{c.title}</h3>;
}

/** Each collection gets its own composition — no two tiles share a layout. */
export function CollectionTile({ c }: { c: ResolvedCollection }) {
  const cover = LOCAL_FILM_MAP.get(c.coverFilmId);
  const link = (children: ReactNode, className?: string) => (
    <Link to={`/collections/${c.slug}`} viewTransition className={cn('group relative block h-full', className)} aria-label={`${c.title} — ${c.description}`}>
      {children}
    </Link>
  );

  let body: ReactNode;
  switch (c.variant) {
    case 'wide':
      body = link(
        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/10]">
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-cinema group-hover:scale-[1.04]">
            <Backdrop title={c.title} path={c.coverPath} posterPath={cover?.poster} palette={cover?.palette} sizes="(min-width:1024px) 66vw, 100vw" />
          </div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <Title c={c} className="text-[clamp(2.4rem,6vw,5.5rem)]" />
            <p className="mt-3 max-w-md text-sm text-ivory/80">{c.description}</p>
            <div className="mt-6">
              <Meta c={c} light />
            </div>
          </div>
        </div>,
      );
      break;
    case 'tall':
      body = link(
        <div className="relative flex h-full min-h-[520px] flex-col justify-between overflow-hidden border border-line p-5 md:p-7" style={{ background: `linear-gradient(160deg, ${c.accent}26, transparent 60%)` }}>
          <div>
            <Title c={c} className="text-[clamp(2rem,4vw,3.25rem)]" />
            <p className="mt-3 max-w-xs text-sm text-silver">{c.description}</p>
          </div>
          <div className="relative my-8 h-[260px]">
            {posters(c, 3).map((f, i) => (
              <div
                key={f.id}
                className="absolute w-[46%] shadow-xl shadow-black/50 transition-transform duration-700 ease-cinema"
                style={{ left: `${i * 26}%`, top: `${[18, 0, 26][i]}%`, zIndex: i === 1 ? 3 : 1 }}
              >
                <Poster title={f.title} path={f.poster} palette={f.palette} sizes="200px" imgClassName="grayscale-[35%] transition-[filter] duration-700 group-hover:grayscale-0" />
              </div>
            ))}
          </div>
          <Meta c={c} />
        </div>,
      );
      break;
    case 'split':
      body = link(
        <div className="grid h-full grid-cols-1 border border-line sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-auto sm:min-h-[340px]">
            <div className="absolute inset-0 transition-transform duration-[1200ms] ease-cinema group-hover:scale-[1.05]">
              <Backdrop title={c.title} path={c.coverPath} posterPath={cover?.poster} palette={cover?.palette} sizes="(min-width:1024px) 25vw, 100vw" focus="60% 50%" />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-8 p-5 md:p-7">
            <div>
              <span className="font-mono text-micro text-acid">C/{c.number}</span>
              <Title c={c} className="mt-4 text-[clamp(2rem,3.1vw,3rem)] [overflow-wrap:anywhere]" />
              <p className="mt-3 text-sm text-silver">{c.description}</p>
            </div>
            <Meta c={c} />
          </div>
        </div>,
      );
      break;
    case 'type':
      body = link(
        <div className="flex h-full flex-col justify-between gap-8 border border-line p-5 md:p-7">
          <p className="font-display text-[clamp(3rem,7.5vw,6.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.055em]">
            {c.title.split(' ').map((word, i) => (
              <span key={i} className={i % 2 === 0 ? 'block text-outline transition-colors duration-700 group-hover:text-ivory/10' : 'block'}>
                {word}
              </span>
            ))}
          </p>
          <h3 className="sr-only">{c.title}</h3>
          <div className="relative aspect-scope overflow-hidden">
            <div className="absolute inset-0 transition-transform duration-[1600ms] ease-cinema group-hover:scale-[1.06]">
              <Backdrop title={c.title} path={c.coverPath} posterPath={cover?.poster} palette={cover?.palette} sizes="(min-width:1024px) 45vw, 100vw" />
            </div>
          </div>
          <div>
            <p className="mb-5 text-sm text-silver">{c.description}</p>
            <Meta c={c} />
          </div>
        </div>,
      );
      break;
    case 'stack':
      body = link(
        <div className="relative flex h-full flex-col justify-between gap-8 overflow-hidden border border-line bg-charcoal/40 p-5 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <Title c={c} className="text-[clamp(2rem,4vw,3.25rem)]" />
            <span className="font-mono text-micro text-silver">C/{c.number}</span>
          </div>
          <div className="flex -space-x-[18%] px-2">
            {posters(c, 4).map((f, i) => (
              <div key={f.id} className="w-1/3 shrink-0 shadow-xl shadow-black/60 transition-transform duration-700 ease-cinema" style={{ transform: `translateY(${i % 2 ? 10 : 0}%)`, zIndex: 4 - i }}>
                <Poster title={f.title} path={f.poster} palette={f.palette} sizes="160px" />
              </div>
            ))}
          </div>
          <div>
            <p className="mb-5 text-sm text-silver">{c.description}</p>
            <Meta c={c} />
          </div>
        </div>,
      );
      break;
    case 'band':
    default:
      body = link(
        <div className="flex h-full flex-col justify-between gap-6 border border-line p-5 md:p-7">
          <div className="relative aspect-scope overflow-hidden">
            <div className="absolute inset-0 transition-transform duration-[1200ms] ease-cinema group-hover:scale-[1.04]">
              {c.coverPath ? (
                <img src={tmdbImage(c.coverPath, 'w1280')!} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 30%' }} />
              ) : (
                <Backdrop title={c.title} path={null} posterPath={cover?.poster} palette={cover?.palette} />
              )}
            </div>
            <span className="absolute left-0 top-0 bg-acid px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink">Spoiler-free zone</span>
          </div>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Title c={c} className="text-[clamp(2.2rem,5vw,4.25rem)]" />
            <p className="max-w-[16rem] text-sm text-silver">{c.description}</p>
          </div>
          <Meta c={c} />
        </div>,
      );
  }

  return <li className={cn('col-span-4', SPAN[c.variant])}>{body}</li>;
}
