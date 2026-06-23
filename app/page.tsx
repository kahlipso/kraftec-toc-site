import RealTimeFinder from './components/RealTimeFinder';
import BrowseCategories from './components/BrowseCategories';
import RecentWorkOrders from './components/RecentWorkOrders';
import AffiliatesCarousel from './components/AffiliatesCarousel';
import KnowThePrice from './components/KnowThePrice';
import Testimonials from './components/Testimonials';
import PlatformFeatures from './components/PlatformFeatures';
import ForProfessionals from './components/ForProfessionals';

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
