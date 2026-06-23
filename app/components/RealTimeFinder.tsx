import Link from 'next/link';
import FinderExperience from './finder/FinderExperience';

export default function RealTimeFinder() {
  return (
    <section
      id="hero"
      className="relative w-full max-w-5xl mx-auto px-6 pt-10 pb-16"
      style={{ animation: 'floatUp 1s ease-out' }}
    >
      {/* Top-right CTA */}
      <Link
        href="/check-quote"
        className="absolute right-6 top-4 rounded-full bg-[#d01111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d01111]/90 active:scale-95 transition"
      >
        Check Price
      </Link>

      {/* Heading block */}
      <div className="flex flex-col items-center text-center">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111] mb-4">
          <span className="size-2 rounded-full bg-[#d01111]" />
          Real-Time Finder
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black leading-tight max-w-3xl">
          Find a pro available in <span className="italic text-[#d01111]">Irvine</span> right now.
        </h1>
        <p className="mt-4 text-base text-zinc-500 max-w-xl">
          A live look at verified pros working across Irvine right now — see who&apos;s near you before you book.
        </p>
      </div>

      {/* Address search + live map + available-near-you list (client, data-source driven) */}
      <FinderExperience />
    </section>
  );
}
