import { ArrowRight, Shuffle } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LOCAL_FILMS } from '@/data/films';
import { tmdbImage } from '@/data/images';
import { useSurprise } from '@/hooks/useSurprise';
import { lineReveal, stagger } from '@/lib/motion';

const LINES = ['Your next', 'favorite film', 'is out there.'];

export function LastFrame() {
  const surprise = useSurprise();
  const reduce = useReducedMotion();
  const strip = useMemo(() => LOCAL_FILMS.filter((f) => f.poster).slice(0, 18), []);

  return (
    <section aria-labelledby="last-frame-title" className="relative overflow-hidden pb-0 pt-28 md:pt-44">
      {/* Projector light: a dark-red bloom rising from below. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[85%] bg-[radial-gradient(60%_70%_at_50%_100%,rgba(116,44,53,0.55),rgba(116,44,53,0.12)_45%,transparent_75%)]" />
      <div aria-hidden className="absolute inset-x-[20%] top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />

      <div className="frame relative">
        <p className="eyebrow flex items-center gap-3">
          <span className="font-mono text-acid">(07)</span> The last frame
        </p>
        {/* The heading observes visibility; lines start clipped inside it, so they can't observe themselves. */}
        <motion.h2
          id="last-frame-title"
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger(0.1)}
          className="mt-8 font-display text-[clamp(2.6rem,10.5vw,11.5rem)] font-semibold uppercase leading-[0.84] tracking-[-0.055em]"
        >
          {LINES.map((line, i) => (
            <span key={line} className={i === 1 ? 'block overflow-hidden md:pl-[1.2em]' : 'block overflow-hidden'}>
              <motion.span className="block pb-[0.04em]" variants={lineReveal}>
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        <div className="mt-12 flex flex-col gap-8 md:mt-16 md:flex-row md:items-end md:justify-between">
          <p className="max-w-sm text-silver">Not everything worth watching announces itself. Go looking — or let us pick.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/discover" viewTransition className="btn-primary">
              Explore all films <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <button type="button" onClick={surprise} className="btn-ghost bg-ink/30">
              <Shuffle className="h-4 w-4 text-acid" aria-hidden /> Surprise me
            </button>
          </div>
        </div>
      </div>

      {/* Contact-sheet strip drifting into the footer. Decorative only. */}
      <div aria-hidden className="relative mt-24 overflow-hidden md:mt-32">
        <div className="flex w-max gap-3 opacity-40 [animation:marquee_90s_linear_infinite] motion-reduce:[animation:none]">
          {[...strip, ...strip].map((f, i) => (
            <img
              key={`${f.id}-${i}`}
              src={tmdbImage(f.poster, 'w154')!}
              alt=""
              loading="lazy"
              className="h-28 w-[4.7rem] object-cover grayscale md:h-40 md:w-[6.7rem]"
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>
    </section>
  );
}
