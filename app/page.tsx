import Image from "next/image";
import Link from 'next/link';
import { Inter } from 'next/font/google';
import AffiliatesCarousel from "./components/AffiliatesCarousel";

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700']
})

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center font-sans bg-white">
      <main className="flex flex-col items-start justify-center gap-6 px-10 py-15 pb-16 w-full max-w-3xl">
        <h1 className={`${inter.className} text-7xl font-medium tracking-tight text-black leading-tight`}
              style={{ animation: "floatUp 1s ease-out" }}
          >
            Know the fair price.
          </h1>
        <h1 className={`${inter.className} text-7xl font-medium leading-1 tracking-tight py-2 text-black`}
              style={{ animation: "floatUp 1s ease-out" }}
          >
            Hire the <i> <b> honest </b> </i> pro.
        </h1>
        <p className="text-base leading-7 text-zinc-500 py-3 max-w-lg"
             style={{ animation: "floatUp 0.8s ease-out 0.8s both" }}
          >
            Most homeowners don't know if they're being overcharged.
            We do. Upload any HVAC quote and find out in seconds — for free,
            with no one calling your phone afterward.
          </p>
        <div className={`${inter.className} flex items-center gap-4`}>
          <Link
            href="/check-quote"
            className="hover:text-black/50 active:scale-95 bg-[#D01111]/35 rounded-full px-5 py-2 inline-block text-black"
            style={{ animation: "floatUp 0.8s ease-out 0.8s both" }}>
              Check a Quote
          </Link>
          <Link
            href="/why-us"
            className="border border-gray-300 hover:text-black/50 active:scale-97 rounded-lg px-5 py-2 inline-block text-black"
            style={{ animation: "floatUp 0.8s ease-out 0.8s both" }}>
              See How We're Different
          </Link>
        </div>
        
      </main>
      <AffiliatesCarousel />
      <section>

      </section>
    </div>
  );
}
