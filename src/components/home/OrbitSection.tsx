import { useMemo } from 'react';
import { LOCAL_FILM_MAP } from '@/data/films';
import { orbitFor } from '@/data/matching';
import { toSummary } from '@/data/repository/local';
import { useWatchlist } from '@/state/watchlist';
import { FilmRail } from '../film/FilmRail';
import { SectionHeading } from '../ui/SectionHeading';

/** Editors' rotation used until the visitor has saved something. */
const EDITORS_ORBIT = [693134, 965150, 545611, 1018, 4977, 531428, 76341, 152601, 62, 11104, 329865, 372058];

export function OrbitSection() {
  const { items } = useWatchlist();
  const orbit = useMemo(() => orbitFor(items.map((i) => i.id)), [items]);
  const films = useMemo(
    () => (orbit?.ids ?? EDITORS_ORBIT).map((id) => LOCAL_FILM_MAP.get(id)).filter((f) => f !== undefined).map(toSummary),
    [orbit],
  );

  return (
    <section aria-labelledby="orbit-title" className="relative overflow-hidden py-20 md:py-28">
      <SectionHeading
        number="03"
        label={orbit ? 'Personal orbit' : 'Editors’ orbit'}
        id="orbit-title"
        title={orbit ? <>Because you saved {orbit.basis.title}</> : 'Films in your orbit'}
        aside={
          orbit
            ? 'Drawn from the moods, genres and directors shared across everything in your watchlist.'
            : 'A rotation of films our editors keep returning to. Save a few, and this rail starts orbiting you instead.'
        }
      />
      <div className="mt-16 md:mt-24">
        <FilmRail films={films} label="Films in your orbit" />
      </div>
    </section>
  );
}
