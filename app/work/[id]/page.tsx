import { notFound } from 'next/navigation';
import { getWorkOrder } from '@/app/lib/work-orders';
import PhotoGallery from '@/app/components/PhotoGallery';

function formatPrice(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getWorkOrder(id);

  // Someone visited /work/<an id that doesn't exist> → show the not-found page.
  if (!order) notFound();

  return (
    <article className="bg-white pb-20">
      <header className="mx-auto max-w-5xl px-6 pt-10">
        <p className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111]">
          <span className="size-2 rounded-full bg-[#d01111]" />
          Job #{order.id} · Completed Work
        </p>

        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-black sm:text-5xl">
          {order.headline}{' '}
          <span className="italic text-[#d01111]">{order.headlineHighlight}</span>
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500">
          <span className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
              {order.proInitials}
            </span>
            <span className="font-medium text-zinc-700">{order.proName}</span>
          </span>
          <span>· {order.outcomeScore}% outcome score</span>
          <span>· 📍 {order.location.city}, {order.location.state} {order.location.zip}</span>
          <span>· Completed <span className="font-medium text-zinc-700">{order.completedDate}</span></span>
          <span>· Duration <span className="font-medium text-zinc-700">{order.duration}</span></span>
        </div>
      </header>

      {/* ---------- Photo gallery ---------- */}
      <section className="mx-auto mt-8 max-w-5xl px-6">
        <PhotoGallery photos={order.photos} />
      </section>

      {/* ---------- Body: story (left) + price (right) ---------- */}
      <section className="mx-auto mt-10 grid max-w-5xl gap-8 px-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Left: the story */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-700">
            <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m2.5 6.5 2.5 2.5 4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Verified at {order.verifiedAtMonths} months
          </span>

          <h2 className="mt-8 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            What we walked into
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600">
            {order.walkedInto}
          </p>

          <h2 className="mt-8 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            What we did
          </h2>
          <ul className="mt-3 flex max-w-xl flex-col gap-3">
            {order.whatWeDid.map((step) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-zinc-600">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#d01111]" />
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: price + facts */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl bg-black p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Total paid</p>
            <p className="mt-1 text-4xl font-bold tracking-tight">{formatPrice(order.totalPaid)}</p>
            <hr className="my-4 border-white/15" />
            <p className="flex items-center gap-1.5 text-xs text-green-400">
              <svg className="size-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m2.5 7.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {order.fairRangeNote}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <ul className="flex flex-col">
              {order.priceBreakdown.map((line, i) => (
                <li
                  key={line.label}
                  className={`flex items-center justify-between py-3 text-sm ${
                    i !== 0 ? 'border-t border-gray-100' : ''
                  }`}
                >
                  <span className="text-zinc-500">{line.label}</span>
                  <span className="font-medium text-black">{line.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {/* ---------- Customer feedback ---------- */}
      <section className="mx-auto mt-10 max-w-5xl px-6">
        <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#d01111] text-sm font-semibold text-white">
                {order.feedback.initials}
              </span>
              <div>
                <p className="text-base font-semibold text-black">{order.feedback.name}</p>
                <p className="text-xs text-zinc-500">{order.feedback.meta}</p>
              </div>
            </div>
            <p className="max-w-[220px] text-right text-[11px] font-semibold uppercase leading-tight tracking-wide text-[#d01111]">
              {order.feedback.reviewedNote}
            </p>
          </div>

          <blockquote className="mt-6 border-l-2 border-[#d01111] pl-4 text-sm leading-relaxed text-zinc-700">
            &quot;{order.feedback.quote}&quot;
          </blockquote>

          <hr className="my-6 border-gray-200" />

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {order.feedback.scores.map((score) => (
              <div key={score.label} className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-black">{score.value}</span>
                <span className="text-xs text-zinc-500">{score.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
