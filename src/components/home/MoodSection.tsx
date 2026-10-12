import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LOCAL_FILM_MAP, LOCAL_FILMS } from '@/data/films';
import { HOME_MOODS } from '@/data/moods';
import { toSummary } from '@/data/repository/local';
import { cn } from '@/lib/cn';
import { pad } from '@/lib/format';
import { EASE_CINEMA } from '@/lib/motion';
import { FilmCard } from '../film/FilmCard';
import { Poster } from '../film/Poster';
import { SectionHeading } from '../ui/SectionHeading';

export function MoodSection() {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = useState(HOME_MOODS[0].id);
  const index = HOME_MOODS.findIndex((m) => m.id === selectedId);
  const mood = HOME_MOODS[index];
  const preview = LOCAL_FILM_MAP.get(mood.previewFilmId)!;

  const tagged = useMemo(() => LOCAL_FILMS.filter((f) => f.moods.includes(mood.tag)), [mood.tag]);
  const films = useMemo(() => tagged.slice(0, 5).map(toSummary), [tagged]);

  return (
    <section aria-labelledby="mood-title" className="relative py-24 md:py-36">
      <SectionHeading
        number="02"
        label="Choose your feeling"
        id="mood-title"
        title={
          <>
            What should tonight
            <br className="hidden md:block" /> feel like?
          </>
        }
        aside="Genres tell you what a film is. We’d rather start with what it does to you. Pick a mood — follow it somewhere unexpected."
      />

      <div className="frame grid-12 mt-14 gap-y-10 md:mt-20">
        {/* Preview frame — mirrors the selected mood. */}
        <div className="relative col-span-4 hidden md:col-span-3 md:block lg:col-span-4">
          <div className="sticky top-24">
            <div className="relative w-full max-w-[340px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={preview.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.2 : 0.8, ease: EASE_CINEMA }}
                >
                  <Poster title={preview.title} year={preview.year} path={preview.poster} palette={preview.palette} sizes="(min-width:1024px) 340px, 25vw" />
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex items-baseline justify-between gap-3 font-mono text-micro uppercase text-silver">
                <span>
                  Mood {pad(index + 1)} / {pad(HOME_MOODS.length)}
                </span>
                <span className="truncate text-ivory/80">{preview.title}</span>
              </div>
            </div>
          </div>
        </div>

        {/* The choices: typographic, not pills. */}
        <div className="col-span-4 md:col-span-5 lg:col-span-7 lg:col-start-6" role="group" aria-label="Choose a mood">
          <ul className="border-t border-line">
            {HOME_MOODS.map((m, i) => {
              const active = m.id === selectedId;
              return (
                <li key={m.id} className="border-b border-line">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedId(m.id)}
                    className="group flex w-full items-start gap-4 py-5 text-left md:gap-6 md:py-6"
                  >
                    <span className={cn('pt-2 font-mono text-micro transition-colors', active ? 'text-acid' : 'text-silver')}>{pad(i + 1)}</span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block font-display text-[clamp(1.7rem,4.4vw,4.25rem)] font-semibold uppercase leading-[0.92] tracking-[-0.04em] transition-all duration-500 ease-cinema',
                          active ? 'translate-x-0 text-ivory' : 'text-ivory/45 group-hover:translate-x-2 group-hover:text-ivory/80',
                        )}
                      >
                        {m.label}
                      </span>
                      <span className={cn('mt-2 block text-sm text-silver transition-opacity duration-500', active ? 'opacity-100' : 'opacity-70 md:opacity-0 md:group-hover:opacity-100')}>
                        {m.line}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={cn('mt-3 h-2.5 w-2.5 shrink-0 transition-all duration-500', active ? 'scale-100 bg-acid' : 'scale-50 bg-line-strong')}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* The update: films carrying the selected mood tag. */}
      <div className="frame mt-16 md:mt-24">
        <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-mono text-micro uppercase text-silver" aria-live="polite">
            <span className="text-ivory">{mood.label}</span> — {tagged.length} films carry this tag in the library
          </p>
          <Link to={`/mood?feel=${mood.feeling}`} viewTransition className="btn-link">
            Follow this feeling <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={mood.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE_CINEMA }}
            className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-5"
          >
            {films.map((f, i) => (
              <li key={f.id} className={cn(i === 4 && 'hidden lg:block', i === 3 && 'hidden sm:block')}>
                <FilmCard film={f} sizes="(min-width:1024px) 18vw, (min-width:640px) 30vw, 45vw" />
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </section>
  );
}
