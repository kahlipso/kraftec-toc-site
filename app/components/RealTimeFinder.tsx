import FinderExperience from './finder/FinderExperience';
import { getFinderSnapshot } from '@/app/lib/pros';

export default async function RealTimeFinder() {
  // Read live from the `pros` table. The homepage is `force-dynamic`, so an
  // address edited in /admin/technicians shows up on the very next request.
  const snapshot = await getFinderSnapshot();

  return (
    <section
      id="hero"
      className="relative w-full pt-4 pb-16"
      style={{ animation: 'floatUp 1s ease-out' }}
    >
      {/* Heading + address search + full-bleed live map (client, data-source
          driven). The heading lives in there because the city it names has to
          track the map center, which is client state. */}
      <FinderExperience snapshot={snapshot} />
    </section>
  );
}
