import { ArrowLeft, ArrowRight, ArrowUpRight, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FilmRail } from '@/components/film/FilmRail';
import { Poster } from '@/components/film/Poster';
import { WatchlistButton } from '@/components/film/WatchlistButton';
import { ErrorState } from '@/components/ui/States';
import { FEELINGS, TIME_OPTIONS, TRAIT_OPTIONS } from '@/data/moods';
import { repository, type RecommendationSet } from '@/data/repository';
import type { Feeling, MoodPreferences, TimeWindow, Trait } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { formatRuntime, pad } from '@/lib/format';
import { EASE_CINEMA } from '@/lib/motion';

type Step = 'intro' | 'feeling' | 'time' | 'trait' | 'results';
const QUESTION_STEPS: Step[] = ['feeling', 'time', 'trait'];

export default function Mood() {
  useDocumentTitle('Mood Finder');
  const [params] = useSearchParams();
  const preset = FEELINGS.find((f) => f.id === params.get('feel'))?.id ?? null;
  const [prefs, setPrefs] = useState<MoodPreferences>({ feeling: preset, time: 'any', trait: null });
  // Arriving from a homepage mood skips straight to the second question.
  const [step, setStep] = useState<Step>(preset ? 'time' : 'intro');
  const [dir, setDir] = useState(1);

  const go = (next: Step) => {
    const order: Step[] = ['intro', ...QUESTION_STEPS, 'results'];
    setDir(order.indexOf(next) >= order.indexOf(step) ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const restart = () => {
    setPrefs({ feeling: null, time: 'any', trait: null });
    go('feeling');
  };

  const qIndex = QUESTION_STEPS.indexOf(step);

  return (
    <div className="relative min-h-[100svh] overflow-hidden pb-24 pt-[calc(var(--nav-h)+2.5rem)] md:pt-[calc(var(--nav-h)+4rem)]">
      <div aria-hidden className="pointer-events-none absolute -left-1/4 top-0 h-[70vh] w-[80vw] bg-[radial-gradient(closest-side,rgba(116,44,53,0.3),transparent)]" />

      {qIndex >= 0 && (
        <div className="frame relative">
          <div className="flex items-center justify-between gap-4 font-mono text-micro uppercase text-silver">
            <span>
              Question <span className="text-ivory">{pad(qIndex + 1)}</span> / {pad(QUESTION_STEPS.length)}
            </span>
            <span className="hidden sm:inline">Mood Finder</span>
          </div>
          <div className="mt-3 h-px w-full bg-line" role="progressbar" aria-label="Mood Finder progress" aria-valuemin={1} aria-valuemax={3} aria-valuenow={qIndex + 1}>
            <motion.div className="h-px bg-acid" animate={{ width: `${((qIndex + 1) / QUESTION_STEPS.length) * 100}%` }} transition={{ duration: 0.6, ease: EASE_CINEMA }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div
          key={step}
          custom={dir}
          initial={{ opacity: 0, x: dir * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -24 }}
          transition={{ duration: 0.45, ease: EASE_CINEMA }}
          className="relative"
        >
          {step === 'intro' && <Intro onStart={() => go('feeling')} />}

          {step === 'feeling' && (
            <Question
              title="What do you want to feel?"
              hint="Choose the emotional direction for tonight."
              onSkip={() => {
                setPrefs((p) => ({ ...p, feeling: null }));
                go('time');
              }}
              onBack={() => go('intro')}
            >
              <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                {FEELINGS.map((f, i) => (
                  <li key={f.id} className="bg-ink">
                    <OptionButton
                      selected={prefs.feeling === f.id}
                      index={i}
                      label={f.label}
                      line={f.line}
                      onSelect={() => {
                        setPrefs((p) => ({ ...p, feeling: f.id as Feeling }));
                        go('time');
                      }}
                      large
                    />
                  </li>
                ))}
              </ul>
            </Question>
          )}

          {step === 'time' && (
            <Question
              title="How much time do you have?"
              hint="We’ll match runtimes to your evening."
              onSkip={() => {
                setPrefs((p) => ({ ...p, time: 'any' }));
                go('trait');
              }}
              onBack={() => go('feeling')}
            >
              <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {TIME_OPTIONS.map((t, i) => (
                  <li key={t.id} className="bg-ink">
                    <OptionButton
                      selected={prefs.time === t.id && (t.id !== 'any' || step !== 'time')}
                      index={i}
                      label={t.label}
                      line={t.line}
                      onSelect={() => {
                        setPrefs((p) => ({ ...p, time: t.id as TimeWindow }));
                        go('trait');
                      }}
                    />
                  </li>
                ))}
              </ul>
            </Question>
          )}

          {step === 'trait' && (
            <Question
              title="What kind of film, though?"
              hint="Pick a viewing preference — or skip and keep it open."
              onSkip={() => {
                setPrefs((p) => ({ ...p, trait: null }));
                go('results');
              }}
              onBack={() => go('time')}
            >
              <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
                {TRAIT_OPTIONS.map((t, i) => (
                  <li key={t.id} className="bg-ink">
                    <OptionButton
                      selected={prefs.trait === t.id}
                      index={i}
                      label={t.label}
                      line={t.line}
                      onSelect={() => {
                        setPrefs((p) => ({ ...p, trait: t.id as Trait }));
                        go('results');
                      }}
                    />
                  </li>
                ))}
              </ul>
            </Question>
          )}

          {step === 'results' && <Results prefs={prefs} onEdit={go} onRestart={restart} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section className="frame flex min-h-[70svh] flex-col justify-center" aria-labelledby="mood-intro-title">
      <p className="eyebrow flex items-center gap-3">
        <span className="h-1.5 w-1.5 bg-acid" aria-hidden /> Mood Finder — three questions, no algorithms
      </p>
      <h1 id="mood-intro-title" className="mt-8 font-display text-[clamp(2.6rem,9vw,9.5rem)] font-semibold uppercase leading-[0.84] tracking-[-0.055em]">
        <span className="block">Don’t search</span>
        <span className="block text-silver">for a movie.</span>
        <span className="block md:pl-[1.2em]">Describe the night.</span>
      </h1>
      <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <p className="max-w-md leading-relaxed text-silver">
          Tell us what you want to feel, how long you have and what kind of film you’re in the mood for. We match your answers against our editors’ mood tags, genres and
          runtimes — and show you exactly why each film fits.
        </p>
        <button type="button" onClick={onStart} className="btn-primary self-start md:self-auto">
          Begin <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  );
}

function Question({ title, hint, children, onSkip, onBack }: { title: string; hint: string; children: ReactNode; onSkip: () => void; onBack: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  // Move focus to each new question so keyboard and screen-reader users land in the right place.
  useEffect(() => heading.current?.focus({ preventScroll: true }), []);
  return (
    <section className="frame mt-12 md:mt-16" aria-labelledby="question-title">
      <h1 id="question-title" ref={heading} tabIndex={-1} className="max-w-5xl font-display text-[clamp(2.3rem,6.5vw,6.5rem)] font-semibold uppercase leading-[0.88] tracking-[-0.05em] focus:outline-none">
        {title}
      </h1>
      <p className="mt-5 text-silver">{hint}</p>
      <div className="mt-10 md:mt-14">{children}</div>
      <div className="mt-8 flex items-center justify-between gap-4">
        <button type="button" onClick={onBack} className="inline-flex min-h-[2.75rem] items-center gap-2 font-mono text-micro uppercase text-silver hover:text-ivory">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back
        </button>
        <button type="button" onClick={onSkip} className="btn-link">
          Skip this question <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </section>
  );
}

function OptionButton({ selected, index, label, line, onSelect, large }: { selected: boolean; index: number; label: string; line: string; onSelect: () => void; large?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'group relative flex h-full w-full flex-col justify-between gap-10 p-5 text-left transition-colors duration-300 md:p-7',
        large ? 'min-h-[11rem] md:min-h-[15rem]' : 'min-h-[9rem] md:min-h-[12rem]',
        selected ? 'bg-ivory text-ink' : 'hover:bg-charcoal',
      )}
    >
      <span className="flex items-center justify-between font-mono text-micro">
        <span className={selected ? 'text-ink/60' : 'text-silver'}>{pad(index + 1)}</span>
        <ArrowUpRight className={cn('h-4 w-4 transition-all duration-500 ease-cinema', selected ? 'text-ink' : 'text-silver group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acid')} aria-hidden />
      </span>
      <span>
        <span className={cn('block font-display font-semibold uppercase leading-[0.9] tracking-[-0.04em]', large ? 'text-[clamp(2rem,4vw,3.5rem)]' : 'text-[clamp(1.5rem,2.6vw,2.25rem)]')}>{label}</span>
        <span className={cn('mt-3 block text-sm', selected ? 'text-ink/70' : 'text-silver')}>{line}</span>
      </span>
    </button>
  );
}

function Results({ prefs, onEdit, onRestart }: { prefs: MoodPreferences; onEdit: (s: Step) => void; onRestart: () => void }) {
  const req = useAsync<RecommendationSet>((signal) => repository.recommend(prefs, signal), [prefs.feeling, prefs.time, prefs.trait]);
  const feeling = FEELINGS.find((f) => f.id === prefs.feeling);
  const time = TIME_OPTIONS.find((t) => t.id === prefs.time);
  const trait = TRAIT_OPTIONS.find((t) => t.id === prefs.trait);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus({ preventScroll: true }), []);

  const curated = req.data?.curated ?? [];
  const anyExact = curated.some((r) => r.exact);

  return (
    <section className="frame" aria-labelledby="results-title">
      <p className="eyebrow flex items-center gap-3">
        <span className="h-1.5 w-1.5 bg-acid" aria-hidden /> Your night, decoded
      </p>
      <h1 id="results-title" ref={heading} tabIndex={-1} className="mt-6 font-display text-[clamp(2.4rem,7.5vw,7.5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.05em] focus:outline-none">
        {feeling ? (
          <>
            Tonight feels like <span className="text-acid">{feeling.label.toLowerCase()}</span>.
          </>
        ) : (
          'Tonight, anything goes.'
        )}
      </h1>

      <dl className="mt-10 flex flex-wrap gap-2">
        {[
          { step: 'feeling' as Step, label: 'Feeling', value: feeling?.label ?? 'Open' },
          { step: 'time' as Step, label: 'Time', value: time && prefs.time !== 'any' ? time.label : 'Any length' },
          { step: 'trait' as Step, label: 'Preference', value: trait?.label ?? 'Open' },
        ].map((c) => (
          <div key={c.step}>
            <dt className="sr-only">{c.label}</dt>
            <dd>
              <button type="button" onClick={() => onEdit(c.step)} className="chip" data-active="true" aria-label={`${c.label}: ${c.value}. Change`}>
                <span className="text-silver">{c.label}</span> {c.value} <span className="text-acid">✎</span>
              </button>
            </dd>
          </div>
        ))}
      </dl>

      {req.status === 'error' && <ErrorState error={req.error} onRetry={req.reload} className="mt-12" />}

      {req.status === 'loading' && !req.data && (
        <ul className="mt-14 space-y-6" aria-hidden>
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="grid grid-cols-12 gap-6 border-t border-line pt-6">
              <div className="skeleton col-span-4 aspect-poster md:col-span-2" />
              <div className="col-span-8 space-y-3 md:col-span-8">
                <div className="skeleton h-8 w-1/2" />
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-16 w-full" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {req.data && (
        <>
          {!anyExact && (
            <p className="mt-10 max-w-2xl border-l-2 border-acid pl-4 text-sm leading-relaxed text-silver">
              No film in the library ticks every box — so here are the closest matches, with the reasons they made the cut.
            </p>
          )}
          <ol className="mt-14 border-b border-line">
            {curated.map((r, i) => (
              <motion.li
                key={r.film.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: EASE_CINEMA }}
                className="grid-12 gap-y-5 border-t border-line py-8 md:py-10"
              >
                <span className="col-span-4 font-mono text-micro text-silver md:col-span-1">
                  {pad(i + 1)}
                  {!r.exact && <span className="mt-1 block text-acid md:mt-2">Close match</span>}
                </span>
                <Link to={`/film/${r.film.id}`} state={{ film: r.film }} viewTransition className="col-span-2 md:col-span-2" aria-label={`Open ${r.film.title}`}>
                  <Poster title={r.film.title} year={r.film.year} path={r.film.posterPath} palette={r.film.palette} sizes="(min-width:768px) 15vw, 45vw" />
                </Link>
                <div className="col-span-4 md:col-span-5 lg:col-span-6">
                  <h2 className="font-display text-[clamp(1.6rem,3.2vw,3rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">
                    <Link to={`/film/${r.film.id}`} state={{ film: r.film }} viewTransition className="hover:text-acid">
                      {r.film.title}
                    </Link>
                  </h2>
                  <p className="mt-2 font-mono text-micro uppercase text-silver">{[r.film.year, formatRuntime(r.film.runtime), r.film.genres.slice(0, 3).join(' / ')].filter(Boolean).join(' · ')}</p>
                  {r.film.overview && <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ivory/80">{r.film.overview}</p>}
                </div>
                <div className="col-span-4 md:col-span-8 md:col-start-4 lg:col-span-3 lg:col-start-10">
                  <h3 className="eyebrow">Why it fits</h3>
                  <ul className="mt-3 space-y-2.5">
                    {r.reasons.map((reason) => (
                      <li key={reason} className="flex gap-3 text-sm leading-snug text-ivory/85">
                        <span className="mt-[0.45rem] h-1 w-1 shrink-0 bg-acid" aria-hidden />
                        {reason}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-center gap-5">
                    <Link to={`/film/${r.film.id}`} state={{ film: r.film }} viewTransition className="btn-link">
                      Open film
                    </Link>
                    <WatchlistButton film={r.film} variant="inline" />
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>

          {req.data.catalogue.length > 0 && (
            <div className="-mx-gutter mt-24">
              <div className="px-gutter">
                <h2 className="eyebrow">From the wider TMDB catalogue</h2>
                <p className="mt-2 max-w-xl text-sm text-silver">Matched by genre and runtime filters on TMDB, sorted by your preference. These carry no AFTERFRAME mood tags.</p>
              </div>
              <div className="mt-20">
                <FilmRail films={req.data.catalogue.map((c) => c.film)} label="Wider catalogue matches" uniform />
              </div>
            </div>
          )}

          <div className="mt-16 flex flex-wrap items-center gap-4">
            <button type="button" onClick={onRestart} className="btn-primary">
              <RotateCcw className="h-4 w-4" aria-hidden /> Start again
            </button>
            <Link to="/discover" viewTransition className="btn-ghost">
              Browse everything
            </Link>
          </div>
          <p className="mt-6 max-w-xl text-xs leading-relaxed text-silver">
            How matching works: each film earns points for AFTERFRAME mood tags and genres that fit your feeling, a runtime inside your window and the viewing preference you chose. No AI
            model is involved — the reasons above are the whole calculation.
          </p>
        </>
      )}
    </section>
  );
}
