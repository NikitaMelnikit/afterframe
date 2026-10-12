import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { LOCAL_FILM_MAP } from '@/data/films';
import { toSummary } from '@/data/repository/local';
import { formatRuntime } from '@/lib/format';
import { EASE_SHUTTER } from '@/lib/motion';
import { Backdrop } from '../film/Backdrop';
import { Poster } from '../film/Poster';
import { Reveal } from '../ui/Reveal';

export function EditorialFeature() {
  const film = LOCAL_FILM_MAP.get(843)!;
  const companion = LOCAL_FILM_MAP.get(11104)!;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.14, 1.04]);
  const posterY = useTransform(scrollYProgress, [0, 1], ['18%', '-18%']);

  return (
    <section ref={ref} aria-labelledby="feature-title" className="relative overflow-hidden bg-charcoal/40 py-24 md:py-40">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_30%,rgba(116,44,53,0.28),transparent_70%)]" />
      <div className="frame grid-12 relative items-start gap-y-10">
        <div className="col-span-4 flex items-center gap-3 md:col-span-8 lg:col-span-12">
          <span className="font-mono text-micro text-acid">(04)</span>
          <span className="eyebrow">Feature — Issue 001</span>
          <span className="rule ml-4 hidden flex-1 md:block" />
          <span className="eyebrow hidden md:inline">On longing</span>
        </div>

        {/* The spread: wide still, masked reveal + parallax. */}
        <figure className="relative col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-1 lg:row-start-2">
          <motion.div
            className="relative aspect-[4/3] overflow-hidden md:aspect-[16/10]"
            initial={reduce ? false : { clipPath: 'inset(12% 0 12% 0)' }}
            whileInView={{ clipPath: 'inset(0% 0 0% 0)' }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1.3, ease: EASE_SHUTTER }}
          >
            <motion.div className="absolute inset-[-7%]" style={reduce ? undefined : { y, scale }}>
              <Backdrop title={film.title} path={film.backdrop} posterPath={film.poster} palette={film.palette} sizes="(min-width:1024px) 66vw, 100vw" focus="40% 50%" />
            </motion.div>
            <div aria-hidden className="absolute inset-0 bg-gradient-to-l from-ink/70 via-transparent to-transparent" />
          </motion.div>
          <figcaption className="mt-3 font-mono text-micro uppercase text-silver md:pl-[31%]">
            Fig. 01 — {film.title} ({film.year}), dir. {film.director}
          </figcaption>

          {/* Companion poster, overlapping the frame edge. */}
          <motion.div style={reduce ? undefined : { y: posterY }} className="absolute -bottom-16 left-[6%] hidden w-[22%] shadow-2xl shadow-black/60 md:block">
            <Link to={`/film/${companion.id}`} state={{ film: toSummary(companion) }} viewTransition aria-label={`${companion.title} — companion film`}>
              <Poster title={companion.title} year={companion.year} path={companion.poster} palette={companion.palette} sizes="15vw" />
            </Link>
          </motion.div>
        </figure>

        {/* The text column — pulls left to overlap the image on large screens. */}
        <div className="relative z-10 col-span-4 md:col-span-6 md:col-start-3 md:mt-16 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:-ml-[22%] lg:mt-24">
          <Reveal>
            <h2 id="feature-title" className="text-display-md font-semibold uppercase [text-shadow:0_2px_30px_rgba(8,9,11,0.7)]">
              The art of losing yourself.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:pl-[22%]">
            <p className="mt-8 text-[1.05rem] leading-relaxed text-ivory/85 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-acid">
              Wong Kar-wai films the ache of almost: corridors too narrow for two people to pass without touching, rain that never quite stops, a melody that returns like a thought
              you can’t put down. To watch <em>In the Mood for Love</em> is to surrender to rhythm over plot — to let slow motion and cigarette smoke do the talking.
            </p>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-silver">
              It is a rare film that feels less like a story you follow than a place you stay. Pair it with <em>Chungking Express</em>, made in a rush between larger productions
              and lit like a fever dream, for the other side of the same lonely city.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 font-mono text-micro uppercase">
              <div>
                <dt className="text-silver">Director</dt>
                <dd className="mt-1 text-ivory">{film.director}</dd>
              </div>
              <div>
                <dt className="text-silver">Year</dt>
                <dd className="mt-1 text-ivory">{film.year}</dd>
              </div>
              <div>
                <dt className="text-silver">Runtime</dt>
                <dd className="mt-1 text-ivory">{formatRuntime(film.runtime)}</dd>
              </div>
              <div>
                <dt className="text-silver">Language</dt>
                <dd className="mt-1 text-ivory">{film.language}</dd>
              </div>
            </dl>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link to={`/film/${film.id}`} state={{ film: toSummary(film) }} viewTransition className="btn-primary">
                Explore the feature <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/collections/after-midnight" viewTransition className="btn-link">
                More after midnight
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
