import RealTimeFinder from './components/RealTimeFinder';
import BrowseCategories from './components/BrowseCategories';
import RecentWorkOrders from './components/RecentWorkOrders';
import AffiliatesCarousel from './components/AffiliatesCarousel';
import KnowThePrice from './components/KnowThePrice';
import Testimonials from './components/Testimonials';
import PlatformFeatures from './components/PlatformFeatures';
import ForProfessionals from './components/ForProfessionals';

// Render per-request (not at build) so the work-order list reflects the live
// database and the build never needs a DB connection.
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 font-sans bg-white">
      <main className="w-full">
        <RealTimeFinder />
        <BrowseCategories />
        <RecentWorkOrders />
        <AffiliatesCarousel />
        <KnowThePrice />
        <Testimonials />
        <PlatformFeatures />
        <ForProfessionals />
      </main>
    </div>
  );
}
