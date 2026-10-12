import { CollectionsSection } from '@/components/home/CollectionsSection';
import { EditorialFeature } from '@/components/home/EditorialFeature';
import { Hero } from '@/components/home/Hero';
import { HiddenGems } from '@/components/home/HiddenGems';
import { LastFrame } from '@/components/home/LastFrame';
import { MoodSection } from '@/components/home/MoodSection';
import { OrbitSection } from '@/components/home/OrbitSection';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function Home() {
  useDocumentTitle(null);
  return (
    <>
      <Hero />
      <MoodSection />
      <OrbitSection />
      <EditorialFeature />
      <CollectionsSection />
      <HiddenGems />
      <LastFrame />
    </>
  );
}
