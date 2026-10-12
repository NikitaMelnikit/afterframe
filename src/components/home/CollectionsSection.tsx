import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COLLECTIONS } from '@/data/collections';
import { CollectionTile } from '../collections/CollectionTile';
import { SectionHeading } from '../ui/SectionHeading';

export function CollectionsSection() {
  return (
    <section aria-labelledby="collections-title" className="relative py-24 md:py-36">
      <SectionHeading
        number="05"
        label="Curated collections"
        id="collections-title"
        title="Six ways into the dark."
        aside="Each collection is an argument about what a film can do to you — assembled by hand, not by algorithm."
        action={
          <Link to="/collections" viewTransition className="btn-link">
            All collections <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        }
      />
      <ul className="frame grid-12 mt-14 gap-y-5 md:mt-20 md:gap-y-6">
        {COLLECTIONS.map((c) => (
          <CollectionTile key={c.slug} c={c} />
        ))}
      </ul>
    </section>
  );
}
