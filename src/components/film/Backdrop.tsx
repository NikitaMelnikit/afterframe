import { useState } from 'react';
import { backdropSrcSet, paletteFor, tmdbImage } from '@/data/images';
import { cn } from '@/lib/cn';

interface BackdropProps {
  title: string;
  path: string | null | undefined;
  /** Used for the designed fallback when no backdrop exists. */
  posterPath?: string | null;
  palette?: [string, string];
  priority?: boolean;
  sizes?: string;
  alt?: string;
  className?: string;
  /** Focal point for object-position, e.g. "50% 30%". */
  focus?: string;
}

/**
 * Fills its (relatively positioned) parent. When there is no backdrop it falls
 * back to a softened, enlarged poster wash — and failing that, a palette field.
 */
export function Backdrop({ title, path, posterPath, palette, priority, sizes = '100vw', alt = '', className, focus = '50% 35%' }: BackdropProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const src = tmdbImage(path, 'w1280');
  const [a, b] = palette ?? paletteFor(title);

  if (src && !failed) {
    return (
      <img
        src={src}
        srcSet={backdropSrcSet(path)}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        style={{ objectPosition: focus }}
        className={cn('absolute inset-0 h-full w-full object-cover halation transition-opacity duration-1000 ease-cinema', loaded ? 'opacity-100' : 'opacity-0', className)}
      />
    );
  }

  const poster = tmdbImage(posterPath, 'w342');
  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden', className)} style={{ background: `radial-gradient(90% 120% at 70% 20%, ${a} 0%, ${b} 75%)` }}>
      {poster && (
        <img src={poster} alt="" loading={priority ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full scale-125 object-cover opacity-40 blur-2xl saturate-150" />
      )}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.025)_0_1px,transparent_1px_4px)]" />
    </div>
  );
}
