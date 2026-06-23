import Link from 'next/link';

type PriceCard = {
  category: string;
  title: string;
  description: string;
  price: string;
  typical: string;
};

const cards: PriceCard[] = [
  { category: 'HVAC', title: 'Capacitor Repair', description: 'Capacitor or contactor replacement on outdoor AC units.', price: '$129', typical: 'Typically $129 – $485 per visit' },
  { category: 'Plumbing', title: 'Faucet Repair', description: 'Fix drips, replace fixtures, or reseat valves on faucets.', price: '$89', typical: 'Typically $89 – $149 per visit' },
  { category: 'Electrical', title: 'Outlet Install', description: 'New outlets, GFCI upgrades, or replace damaged receptacles.', price: '$75', typical: 'Typically $75 – $120 per outlet' },
  { category: 'Cleaning', title: 'Deep Home Clean', description: 'Full home deep clean — kitchen, baths, bedrooms, living.', price: '$149', typical: 'Typically $149 – $299 by size' },
  { category: 'Landscaping', title: 'Lawn Mowing', description: 'Mow, edge, and blowout for residential properties.', price: '$45', typical: 'Typically $45 – $95 per visit' },
  { category: 'Painting', title: 'Interior Room', description: 'Full room prep, prime, and two coats — walls or walls+ceiling.', price: '$200', typical: 'Typically $200 – $450 per room' },
];

const features = ['Diagnosis included', 'Parts + labor', '90-day guarantee'];

function Check() {
  return (
    <svg className="size-3.5 shrink-0 text-[#d01111]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m2.5 7.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function KnowThePrice() {
  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111] mb-4">
            <span className="size-2 rounded-full bg-[#d01111]" />
            Know the Price
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-black leading-tight">
            Real prices. Real pros.<br />
            <span className="italic text-[#d01111]">Before we show up</span>
          </h2>
          <p className="mt-5 text-base text-zinc-500 max-w-xl">
            Real prices set by real pros. No callbacks, no quote games. See it before you book it.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-xl border border-gray-200 border-l-2 border-l-[#d01111] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[#d01111]">{card.category}</p>
              <h3 className="mt-1 text-lg font-semibold text-black">{card.title}</h3>
              <p className="mt-2 text-sm text-zinc-500">{card.description}</p>

              <p className="mt-5 text-sm text-zinc-400">Starting at</p>
              <p className="text-4xl font-bold tracking-tight text-black">{card.price}</p>
              <p className="mt-1 text-xs text-zinc-400">{card.typical}</p>

              <hr className="my-4 border-gray-100" />

              <ul className="flex flex-col gap-2">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-700">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/check-quote"
                className="mt-5 flex items-center justify-center gap-1.5 rounded-lg bg-[#d01111]/10 px-4 py-2.5 text-sm font-semibold text-[#d01111] transition-colors hover:bg-[#d01111]/15"
              >
                Check your quote →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
