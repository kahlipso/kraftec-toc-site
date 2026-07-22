import Link from 'next/link';
import FinderExperience from './finder/FinderExperience';

export default function RealTimeFinder() {
  return (
    <section
      id="hero"
      className="relative w-full pt-4 pb-16"
      style={{ animation: 'floatUp 1s ease-out' }}
    >
      {/* Heading block — stays in the centered content column */}
      <div className="relative mx-auto w-full max-w-5xl px-6">

        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-4xl font-bold tracking-tight text-black leading-tight max-w-3xl">
            Find your pro in <span className="italic text-[#d01111]">Irvine</span> right now.
          </h1>
        </div>
      </div>

      {/* Address search + full-bleed live map (client, data-source driven) */}
      <FinderExperience />
    </section>
  );
}
