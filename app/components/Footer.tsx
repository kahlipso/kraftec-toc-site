import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700']
})

export default function Footer() {
  return (
    <footer className={`${inter.className} bg-white px-8 py-12`}>
      <div className="flex flex-wrap justify-between gap-10 mx-auto">

        <div className="tracking-wider px-20">
          <h2 className="text-xl text-black font-semibold">Kraftec</h2>
          <p className="text-base text-taupe-500 py-3">
            The fair-price layer for home services.
            Free for homeowners, forever. <br/>
            Built so honest pros can finally win on honesty.
          </p>
          <br />
          <p className="text-black">2961 Medinah Ct.,</p>
          <p className="text-black">Atlanta, GA 30341</p>
          <p className="text-black">info@mykraftec.com</p>
          <p className="text-black">Tel: 678-666-0040</p>
        </div>

        <div className="flex gap-16 racking-wider px-20">

          <div>
            <h2 className="text-xl text-black font-semibold">Features</h2>
            <ul className="flex flex-col gap-2 text-base text-taupe-500 py-3">
              <li><Link href="/">Core features</Link></li>
              <li><Link href="/">Pro experience</Link></li>
              <li><Link href="/">Integrations</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl text-black font-semibold">Learn more</h2>
            <ul className="flex flex-col gap-2 text-sm text-gray-500 py-3">
              <li><Link href="/">Blog</Link></li>
              <li><Link href="/">Case studies</Link></li>
              <li><Link href="/">Customer stories</Link></li>
              <li><Link href="/">Best practices</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl text-black font-semibold">Support</h2>
            <ul className="flex flex-col gap-2 text-sm text-gray-500 py-3">
              <li><Link href="/">Contact</Link></li>
              <li><Link href="/">Support</Link></li>
              <li><Link href="/">Legal</Link></li>
            </ul>
          </div>

        </div>

      </div>

      <br/>
      <br/>
      <br/>
    </footer>
  );
}