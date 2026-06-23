import Link from 'next/link';
import Image from 'next/image';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700']
})

export default function Navbar() {
  return (
    <header className={`${inter.className} flex items-center justify-between px-6 py-5 bg-white border-b border-gray-200`}>

      <Link className="px-2" href="/">
        <Image
          src="/kraftec-logo-full.png"
          alt="Kraftec Logo"
          width={240}
          height={70}
        />
      </Link>

      <nav>
        <ul className="text-base text-black flex gap-20 list-none">
          <li><Link href="/" className="hover:text-black/50 active:scale-95 inline-block">Home</Link></li>
          <li><Link href="/check-quote" className="hover:text-black/50 active:scale-95 inline-block">Check a Quote</Link></li>
          <li><Link href="/find-pro" className="hover:text-black/50 active:scale-95 inline-block">Find Your Pro</Link></li>
          <li><Link href="/why-us" className="hover:text-black/50 active:scale-95 inline-block">Why Us</Link></li>
        </ul>
      </nav>

      <div className="text-black nav-login px-5">
        <Link href="/get-started" className="btn">Login</Link>
      </div>
    </header>
  );
}