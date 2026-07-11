import TradePicker from './TradePicker';
import { isTrade } from '@/app/lib/trades';

const steps = [
  {
    icon: '📍',
    n: '01',
    title: 'Tell us where you are',
    body: "Enter your address so we can find the closest verified pros to your home. That's all we need to start.",
  },
  {
    icon: '🔗',
    n: '02',
    title: 'We match you to one pro',
    body: 'We surface the closest, best-value verified pro for your job — outcome-scored, never paid placement.',
  },
  {
    icon: '🔒',
    n: '03',
    title: 'Book — your number stays private',
    body: 'Only the pro you choose gets contacted, and only after you confirm. We never sell your number.',
  },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // Read the trade the homepage sent us via ?category=. If it's missing or not a
  // real trade (e.g. arrived from the navbar), start with nothing selected.
  const { category } = await searchParams;
  const initialTrade = isTrade(category) ? category : null;

  return (
    <div className="bg-white pb-20">
      <div className="mx-auto max-w-5xl px-6 pt-10">
        {/* Header */}
        <h1 className="text-3xl font-bold tracking-tight text-black">Find an honest pro near you.</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Outcome-verified. Continuously re-checked. No paid placement.
        </p>

        {/* Trade picker + conditional address bar */}
        <TradePicker initialTrade={initialTrade} />

        {/* How it works */}
        <section className="mt-20">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111]">
            <span className="size-2 rounded-full bg-[#d01111]" />
            How it works
          </p>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Enter your address to <span className="italic text-[#d01111]">get started</span>.
          </h2>
          <p className="mt-3 text-center text-base text-zinc-500">
            Three steps, no spam calls, and your number stays private until you decide to book.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <span className="flex size-14 items-center justify-center rounded-full bg-[#d01111]/10 text-2xl">
                    {step.icon}
                  </span>
                  <span className="text-4xl font-bold text-[#d01111]/15">{step.n}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{step.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-zinc-500">
            🔒 Free to use · No shared leads · Outcome-verified pros only
          </p>
        </section>
      </div>
    </div>
  );
}
