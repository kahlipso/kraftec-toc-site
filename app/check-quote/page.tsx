import CheckQuoteForm from './CheckQuoteForm';

const perks = ['Free forever', 'Stays anonymous', 'Result in seconds'];

function Check() {
  return (
    <svg className="size-3.5 shrink-0 text-[#d01111]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m2.5 7.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Page() {
  return (
    <div className="bg-white pb-20">
      <div className="mx-auto max-w-2xl px-6 pt-12">
        {/* Intro */}
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111]">
          <span className="size-2 rounded-full bg-[#d01111]" />
          Check a Quote
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-black sm:text-5xl">
          Is your quote <span className="italic text-[#d01111]">fair?</span>
        </h1>
        <p className="mt-4 text-base text-zinc-500">
          Share what you were quoted. We compare it against verified jobs in your area and tell you
          whether you&apos;re being charged a fair price.
        </p>

        {/* Perks */}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {perks.map((perk) => (
            <span key={perk} className="flex items-center gap-1.5 text-sm text-zinc-600">
              <Check />
              {perk}
            </span>
          ))}
        </div>

        {/* Form */}
        <CheckQuoteForm />
      </div>
    </div>
  );
}
