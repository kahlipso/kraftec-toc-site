import Image from 'next/image';
import Link from 'next/link';
import { trades as categories } from '@/app/lib/trades';

export default function BrowseCategories() {
  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black text-center mb-9">
          How can we help?
        </h2>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/find-pro?category=${cat.slug}`}
              className="flex flex-col items-center gap-3 w-[104px] sm:w-[116px] group"
            >
              <span className="flex items-center justify-center size-[104px] sm:size-[116px] rounded-3xl bg-white border border-[#e5e5e5] shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:border-[#d01111]/50 group-hover:bg-[#fff5f5] group-hover:shadow-lg group-active:translate-y-0">
                <Image
                  src={`/category-icons/${cat.slug}.svg`}
                  alt=""
                  width={56}
                  height={56}
                  unoptimized
                  className="size-12 sm:size-14 transition-transform duration-200 group-hover:scale-110"
                />
              </span>
              <span className="text-[13px] font-semibold text-[#3f3f3f] text-center leading-tight transition-colors group-hover:text-[#d01111]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
