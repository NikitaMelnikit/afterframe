import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COLLECTIONS } from '@/data/collections';
import { NAV_ITEMS } from './nav-items';
import { Wordmark } from './Wordmark';

export function Footer() {
  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  };

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink pb-[env(safe-area-inset-bottom)]">
      <div className="frame grid-12 gap-y-12 pb-10 pt-16 md:pt-24">
        <div className="col-span-4 md:col-span-8 lg:col-span-5">
          <Wordmark className="text-3xl md:text-4xl" />
          <p className="mt-6 max-w-sm font-display text-xl leading-snug tracking-tight text-ivory/90">Every film leaves something behind. We help you find the ones that do.</p>
        </div>

        <nav aria-label="Footer" className="col-span-2 md:col-span-3 lg:col-span-2 lg:col-start-7">
          <p className="eyebrow mb-4">Navigate</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/" viewTransition className="text-ivory/80 transition-colors hover:text-acid">
                Home
              </Link>
            </li>
            {NAV_ITEMS.map((i) => (
              <li key={i.to}>
                <Link to={i.to} viewTransition className="text-ivory/80 transition-colors hover:text-acid">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Collections" className="col-span-2 md:col-span-3 lg:col-span-3">
          <p className="eyebrow mb-4">Collections</p>
          <ul className="space-y-2.5 text-sm">
            {COLLECTIONS.map((c) => (
              <li key={c.slug}>
                <Link to={`/collections/${c.slug}`} viewTransition className="text-ivory/80 transition-colors hover:text-acid">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-4 md:col-span-8 lg:col-span-12">
          <div className="rule" />
          <div className="mt-8 max-w-2xl text-[0.8rem] leading-relaxed text-silver">
            <p>
              AFTERFRAME is an independent demonstration project for film discovery. It does not stream, sell or host films, and editorial notes and mood tags are opinions, not reviews or
              ratings. Typography: Space Grotesk, Inter, JetBrains Mono. Icons: Lucide.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 font-mono text-micro uppercase text-silver">
            <span>© {new Date().getFullYear()} AFTERFRAME — Find the film that stays with you.</span>
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-acid">
              Data & images: TMDB<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <button type="button" onClick={toTop} className="group inline-flex min-h-[2.75rem] items-center gap-2 text-ivory">
              Back to top
              <span className="grid h-8 w-8 place-items-center border border-line-strong transition-colors group-hover:border-acid group-hover:text-acid">
                <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              </span>
            </button>
          </div>
        </div>
      </div>
      {/* Intentionally cropped wordmark — the last frame of the page. */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p className="translate-y-[18%] whitespace-nowrap text-center font-display text-[21.5vw] font-semibold uppercase leading-[0.78] tracking-[-0.065em] text-ivory/[0.045]">
          Afterframe
        </p>
      </div>
    </footer>
  );
}
