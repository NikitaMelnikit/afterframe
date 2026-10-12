import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { LOCAL_FILM_MAP } from '@/data/films';
import { toSummary } from '@/data/repository/local';
import { useFinePointer } from '@/hooks/useMediaQuery';
import { formatRuntime } from '@/lib/format';
import { EASE_CINEMA, EASE_SHUTTER } from '@/lib/motion';
import { markIntroSeen, RETURNING_VISITOR } from '@/state/intro';
import { Backdrop } from '../film/Backdrop';

/** Editorial cover for Issue 001. Chosen by the editors, not presented as "trending". */
const FEATURE_ID = 335984;
const LINES = ['Not every film', 'ends with', 'the credits.'];

export function Hero() {
  const film = LOCAL_FILM_MAP.get(FEATURE_ID)!;
  const summary = toSummary(film);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const section = useRef<HTMLElement>(null);
  const light = useRef<HTMLDivElement>(null);
  // Returning visitors get the same choreography at roughly a third of the length.
  const [pace] = useState(() => (RETURNING_VISITOR ? 0.35 : 1));
  const t = (s: number) => s * pace;

  useEffect(() => markIntroSeen(), []);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const dim = useTransform(scrollYProgress, [0, 0.9], [0, 0.6]);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!fine || !light.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    light.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
    light.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: t(0.9), delay: t(delay), ease: EASE_CINEMA },
        };

  return (
    <section
      ref={section}
      onPointerMove={onPointerMove}
      aria-labelledby="hero-title"
      className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink md:min-h-[700px]"
    >
      {/* 1 — The frame: directional wipe + slow settle, then gentle parallax on scroll. */}
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: imageY }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: t(1.5), ease: EASE_SHUTTER }}
        >
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { scale: 1.16 }}
            animate={{ scale: 1.04 }}
            transition={{ duration: t(2.8), ease: EASE_CINEMA }}
          >
            {/* On wide screens the frame is widened so the lone figure lands right of the headline. */}
            <div className="absolute inset-y-0 left-0 w-full lg:w-[165%]">
              <Backdrop title={film.title} path={film.backdrop} posterPath={film.poster} palette={film.palette} priority focus="50% 45%" alt="" />
            </div>
          </motion.div>
        </motion.div>
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute inset-y-0 w-px bg-acid/80"
            initial={{ left: '0%', opacity: 1 }}
            animate={{ left: '100%', opacity: 0 }}
            transition={{ duration: t(1.5), ease: EASE_SHUTTER }}
          />
        )}
      </motion.div>

      {/* Legibility & atmosphere — only where the type needs it. */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/30 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
      <div aria-hidden className="vignette absolute inset-0" />
      <div aria-hidden className="absolute -right-1/4 -top-1/3 h-[80vh] w-[70vw] bg-[radial-gradient(closest-side,rgba(116,44,53,0.35),transparent)] mix-blend-screen" />
      <motion.div aria-hidden className="absolute inset-0 bg-ink" style={{ opacity: dim }} />
      {fine && (
        <div
          ref={light}
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light [background:radial-gradient(520px_circle_at_var(--x,70%)_var(--y,40%),rgba(241,238,231,0.16),transparent_60%)]"
        />
      )}

      {/* 2–5 — Type, staggered after the frame lands. */}
      <motion.div style={reduce ? undefined : { y: contentY }} className="frame relative z-10 flex h-full flex-col justify-end pb-[7.5rem] pt-nav md:pb-36">
        <motion.p {...enter(0.45)} className="eyebrow flex items-center gap-3 text-ivory/80">
          <span className="h-1.5 w-1.5 bg-acid" aria-hidden />
          Issue 001 — The art of getting lost
        </motion.p>

        <h1 id="hero-title" className="mt-5 font-display text-[clamp(2.3rem,min(10.2vw,15.5vh),12rem)] font-semibold uppercase leading-[0.86] tracking-[-0.05em] md:mt-7">
          {LINES.map((line, i) => (
            <span key={line} className={i === 1 ? 'block overflow-hidden pl-[0.9em] md:pl-[1.6em]' : 'block overflow-hidden'}>
              <motion.span
                className="block pb-[0.04em]"
                initial={reduce ? false : { y: '108%' }}
                animate={{ y: '0%' }}
                transition={{ duration: t(1.05), delay: t(0.7 + i * 0.12), ease: EASE_CINEMA }}
              >
                {i === LINES.length - 1 ? (
                  <>
                    {line.slice(0, -1)}
                    <span className="text-acid">.</span>
                  </>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="mt-8 grid items-end gap-6 md:mt-10 md:grid-cols-12">
          <motion.p {...enter(1.15)} className="max-w-md text-base leading-relaxed text-ivory/80 md:col-span-5 md:text-lg">
            Discover the stories, moods and moments that stay with you.
          </motion.p>
          <motion.div {...enter(1.25)} className="flex flex-wrap gap-3 md:col-span-7 md:justify-end">
            <Link to="/collections" viewTransition className="btn-primary">
              Enter the collection <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/mood" viewTransition className="btn-ghost bg-ink/30 backdrop-blur-sm">
              Find my next film
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 5 — Featured-film metadata along the lower edge, last to arrive. */}
      <motion.div {...enter(1.55)} className="absolute inset-x-0 bottom-0 z-10 border-t border-ivory/10 bg-ink/40 backdrop-blur-md">
        <div className="frame flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          <div className="flex min-w-0 items-center gap-3 md:gap-6">
            <span className="eyebrow hidden lg:inline">Cover frame</span>
            <span className="hidden h-4 w-px bg-line-strong lg:inline" aria-hidden />
            <span className="truncate font-display text-[0.95rem] font-medium tracking-tight md:text-base">{film.title}</span>
            <span className="hidden shrink-0 font-mono text-micro text-silver sm:inline">
              {film.year} · {film.genres.join(' / ')} · {formatRuntime(film.runtime)}
            </span>
            <span className="hidden shrink-0 font-mono text-micro text-silver xl:inline">Dir. {film.director}</span>
          </div>
          <Link to={`/film/${film.id}`} state={{ film: summary }} viewTransition className="btn-link shrink-0">
            Explore film <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </motion.div>

      {/* 6 — A restrained invitation to scroll. */}
      <motion.div {...enter(1.85)} aria-hidden className="absolute bottom-28 right-[calc(var(--gutter)/2_-_0.4rem)] z-10 hidden flex-col items-center gap-3 md:flex">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-silver [writing-mode:vertical-rl]">Scroll</span>
        <span className="relative h-14 w-px overflow-hidden bg-line">
          <span className="absolute inset-0 animate-scroll-cue bg-ivory" />
        </span>
      </motion.div>
    </section>
  );
}
