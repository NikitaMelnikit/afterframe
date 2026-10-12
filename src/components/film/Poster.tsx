import { forwardRef, useState, type CSSProperties } from 'react';
import { paletteFor, posterSrcSet, tmdbImage } from '@/data/images';
import { cn } from '@/lib/cn';

interface PosterProps {
  title: string;
  year?: number | null;
  path: string | null | undefined;
  palette?: [string, string];
  /** `sizes` attribute for responsive selection. */
  sizes?: string;
  priority?: boolean;
  /** Empty by default: cards already expose the title as text. */
  alt?: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  /** Marks this poster as the destination of the shared-element view transition. */
  shared?: boolean;
}

/**
 * Poster with a fixed 2:3 frame (no layout shift), lazy loading, srcset and a
 * designed fallback composition when artwork is missing or fails to load.
 */
export const Poster = forwardRef<HTMLDivElement, PosterProps>(function Poster(
  { title, year, path, palette, sizes = '(min-width: 1024px) 20vw, 45vw', priority, alt = '', className, imgClassName, style, shared },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const src = tmdbImage(path, 'w342');
  const showImage = Boolean(src) && !failed;

  return (
    <div
      ref={ref}
      style={shared ? { ...style, viewTransitionName: 'film-poster' } : style}
      data-shared-poster={shared ? '' : undefined}
      className={cn('relative aspect-poster w-full overflow-hidden bg-charcoal', className)}
    >
      {showImage ? (
        <img
          src={src!}
          srcSet={posterSrcSet(path)}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-cinema',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      ) : (
        <PosterFallback title={title} year={year} palette={palette} label={alt || undefined} />
      )}
      {showImage && !loaded && <div className="skeleton absolute inset-0" aria-hidden />}
    </div>
  );
});

export function PosterFallback({ title, year, palette, label }: { title: string; year?: number | null; palette?: [string, string]; label?: string }) {
  const [a, b] = palette ?? paletteFor(title);
  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label ? `${label} (designed placeholder)` : undefined}
      aria-hidden={label ? undefined : true}
      className="absolute inset-0 flex flex-col justify-between overflow-hidden p-[8%]"
      style={{ background: `radial-gradient(120% 80% at 20% 0%, ${a} 0%, ${b} 70%)` }}
    >
      <div className="absolute inset-[5%] border border-ivory/15" />
      <div className="absolute inset-0 opacity-30 mix-blend-overlay vignette" />
      <span className="relative font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ivory/60">AFTERFRAME</span>
      <div className="relative">
        <span className="block font-display text-[clamp(0.95rem,2.2vw,1.6rem)] font-semibold uppercase leading-[0.92] tracking-tight text-ivory [overflow-wrap:anywhere]">
          {title}
        </span>
        {year && <span className="mt-2 block font-mono text-[0.65rem] tracking-[0.14em] text-ivory/60">{year}</span>}
      </div>
    </div>
  );
}
