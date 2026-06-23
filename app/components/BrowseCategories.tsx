import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { name: 'Handyperson', slug: 'handyperson' },
  { name: 'Landscaping', slug: 'landscaping' },
  { name: 'Plumbing', slug: 'plumbing' },
  { name: 'Electrical', slug: 'electrical' },
  { name: 'Remodeling', slug: 'remodeling' },
  { name: 'Roofing', slug: 'roofing' },
  { name: 'Painting', slug: 'painting' },
  { name: 'Cleaning', slug: 'cleaning' },
  { name: 'HVAC', slug: 'hvac' },
  { name: 'Windows', slug: 'windows' },
  { name: 'Concrete', slug: 'concrete' },
];

export default function BrowseCategories() {
  return (
    <section className="w-full bg-white py-9">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-xl font-semibold text-black text-center mb-7">
          How can we help?
        </h2>

        <div className="flex flex-wrap justify-center gap-x-[18px] gap-y-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/find-pro?category=${cat.slug}`}
              className="flex flex-col items-center gap-2.5 w-[72px] group"
            >
              <span className="flex items-center justify-center size-[72px] rounded-2xl bg-[#fafafa] border border-[#e0e0e0] transition-colors group-hover:border-[#d01111]/40 group-hover:bg-[#fff5f5]">
                <Image
                  src={`/category-icons/${cat.slug}.svg`}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="size-10"
                />
              </span>
              <span className="text-[10px] font-medium text-[#7c7c7c] text-center leading-none">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
