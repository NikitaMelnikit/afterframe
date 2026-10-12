import { LOCAL_FILM_MAP } from '@/data/films';
import { cn } from '@/lib/cn';
import { Poster } from '../film/Poster';

/**
 * Contact-sheet composition for collections whose cover has no verified
 * backdrop: three posters laid edge to edge on an accent-tinted field.
 */
export function PosterTriptych({
  ids,
  accent,
  className,
  sizes = '20vw',
  align = 'center',
}: {
  ids: number[];
  accent: string;
  className?: string;
  sizes?: string;
  align?: 'center' | 'start';
}) {
  const films = ids
    .map((id) => LOCAL_FILM_MAP.get(id))
    .filter((f) => f?.poster)
    .slice(0, 3);
  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 flex justify-center gap-[3%] overflow-hidden px-[6%]', align === 'center' ? 'items-center' : 'items-start', className)}
      style={{ background: `radial-gradient(120% 100% at 50% 0%, ${accent}33, transparent 70%)` }}
    >
      {films.map((f, i) => (
        <div key={f!.id} className={cn('w-[28%] shrink-0 shadow-2xl shadow-black/60', i === 1 ? '-translate-y-[6%]' : 'translate-y-[4%]')}>
          <Poster title={f!.title} path={f!.poster} palette={f!.palette} sizes={sizes} />
        </div>
      ))}
    </div>
  );
}
