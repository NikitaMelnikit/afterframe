import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useMemo, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { LOCAL_FILMS } from '@/data/films';
import { toSummary } from '@/data/repository/local';
import { useFinePointer } from '@/hooks/useMediaQuery';
import { formatRuntime, pad } from '@/lib/format';
import { Poster } from '../film/Poster';
import { WatchlistButton } from '../film/WatchlistButton';
import { SectionHeading } from '../ui/SectionHeading';

export function HiddenGems() {
  const gems = useMemo(() => LOCAL_FILMS.filter((f) => f.gem), []);
  const fine = useFinePointer();
  const [hovered, setHovered] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });
  const active = gems.find((g) => g.id === hovered);

  // A fixed-position preview must not linger when the list scrolls out from under the cursor.
  useEffect(() => {
    if (hovered == null) return;
    const clear = () => setHovered(null);
    window.addEventListener('scroll', clear, { passive: true, once: true });
    return () => window.removeEventListener('scroll', clear);
  }, [hovered]);

  // The preview floats above the cursor so the hovered row's own text is never covered.
  const onMove = (e: PointerEvent) => {
    x.set(e.clientX + 24);
    y.set(e.clientY - 250);
  };

  return (
    <section aria-labelledby="gems-title" className="relative py-24 md:py-36">
      <SectionHeading
        number="06"
        label="Hidden gems"
        id="gems-title"
        title={
          <>
            Not everything worth watching
            <br className="hidden lg:block" /> is on the front page.
          </>
        }
        aside="An editorial selection: films our curators believe deserve more company. Chosen by taste — not by charts, view counts or algorithms."
      />

      <ol className="frame mt-14 md:mt-20" onPointerMove={fine ? onMove : undefined} onPointerLeave={() => setHovered(null)}>
        {gems.map((f, i) => (
          <li key={f.id} className="group relative border-t border-line last:border-b" onPointerEnter={() => fine && setHovered(f.id)}>
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 md:grid-cols-12 md:gap-6 md:py-7">
              <span className="font-mono text-micro text-silver md:col-span-1">{pad(i + 1)}</span>
              <Link
                to={`/film/${f.id}`}
                state={{ film: toSummary(f) }}
                viewTransition
                className="flex min-w-0 items-center gap-4 md:col-span-10 md:grid md:grid-cols-10 md:gap-6"
              >
                <span className="w-14 shrink-0 md:hidden">
                  <Poster title={f.title} year={f.year} path={f.poster} palette={f.palette} sizes="56px" />
                </span>
                <span className="min-w-0 md:col-span-5">
                  <span className="block truncate font-display text-[clamp(1.35rem,3.4vw,2.75rem)] font-semibold uppercase leading-none tracking-[-0.035em] transition-colors duration-300 group-hover:text-acid">
                    {f.title}
                  </span>
                  <span className="mt-2 block font-mono text-micro text-silver md:hidden">
                    {f.year} · {f.director}
                  </span>
                </span>
                <span className="hidden font-mono text-micro uppercase text-silver md:col-span-2 md:block">
                  {f.director}
                  <br />
                  {f.year} · {formatRuntime(f.runtime)}
                </span>
                <span className="hidden text-sm leading-snug text-ivory/75 md:col-span-3 md:block">{f.note}</span>
              </Link>
              <div className="flex items-center justify-end gap-1 md:col-span-1">
                <WatchlistButton film={toSummary(f)} />
                <ArrowUpRight className="hidden h-5 w-5 text-silver transition-colors group-hover:text-acid lg:block" aria-hidden />
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Cursor-following preview (fine pointers only; purely decorative). */}
      {fine && (
        <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-40 hidden w-[150px] lg:block" style={{ x: sx, y: sy }}>
          <AnimatePresence>
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-x-0 top-0 shadow-2xl shadow-black/70"
              >
                <Poster title={active.title} year={active.year} path={active.poster} palette={active.palette} sizes="180px" priority />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
