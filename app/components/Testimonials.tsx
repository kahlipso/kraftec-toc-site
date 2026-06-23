type Review = {
  quote: string;
  initials: string;
  name: string;
  meta: string;
};

const reviews: Review[] = [
  {
    quote: 'Two other companies quoted me $11,400 for the same AC replacement. Kraftec connected me with Martinez & Reyes for $8,940 — same scope, on time, system still works perfectly a year later.',
    initials: 'DM',
    name: 'Diana M.',
    meta: 'Phoenix, AZ · HVAC Replacement',
  },
  {
    quote: "Uploaded my plumbing quote and Kraftec's tool said I was being charged 40% above local average. Used that to negotiate. Saved $620 on a $1,500 repair job.",
    initials: 'BK',
    name: 'Brad K.',
    meta: 'Tempe, AZ · Plumbing Repair',
  },
  {
    quote: 'Got a real-time price in seconds, found a verified pro who came that day. No phone tag, no callbacks. Total transparency from start to finish.',
    initials: 'MS',
    name: 'Maria S.',
    meta: 'Scottsdale, AZ · HVAC Repair',
  },
];

function Stars() {
  return (
    <div className="flex gap-1 text-[#d01111]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-base leading-none">★</span>
      ))}
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
      <svg className="size-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m2.5 6.5 2.5 2.5 4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verified
    </span>
  );
}

export default function Testimonials() {
  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111] mb-4">
            <span className="size-2 rounded-full bg-[#d01111]" />
            From real homeowners
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-black leading-tight">
            What people say <span className="italic text-[#d01111]">after we leave</span>.
          </h2>
          <p className="mt-5 text-base text-zinc-500 max-w-2xl">
            Reviews come from verified jobs. We follow up at 90 days and 12 months to make sure the work held up.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.name} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6">
              <Stars />
              <p className="mt-4 text-sm leading-relaxed text-zinc-700">&quot;{review.quote}&quot;</p>

              <hr className="my-5 border-gray-100" />

              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
                  {review.initials}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-black">{review.name}</p>
                    <VerifiedBadge />
                  </div>
                  <p className="text-xs text-zinc-500">{review.meta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
