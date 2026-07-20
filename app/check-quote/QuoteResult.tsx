'use client';

import Link from 'next/link';
import type { LineFlag, QuoteCheckResult } from '@/app/types/quote';

// The Check Quote result view (Figma "Check Quote — Result"). Pure presentation:
// everything is computed server-side; this renders the analysis it's given.

function money(n: number) {
  return `$${n.toLocaleString()}`;
}

const flagStyles: Record<Exclude<LineFlag, 'no_benchmark'>, { label: (l: { marketHigh?: number; cost: number }) => string; cls: string }> = {
  in_range: { label: () => 'In range', cls: 'bg-green-50 text-green-700' },
  high: { label: () => 'High but defensible', cls: 'bg-amber-50 text-amber-700' },
  above_market: {
    label: (l) => (l.marketHigh ? `${(l.cost / l.marketHigh).toFixed(1)}× market high` : 'Above market'),
    cls: 'bg-red-50 text-red-700',
  },
};

export default function QuoteResult({
  result,
  onReset,
}: {
  result: Extract<QuoteCheckResult, { ok: true }>;
  onReset: () => void;
}) {
  // Gauge geometry: green = up to fairLow, amber = fair range, red = beyond.
  // Scale tops out at 1.8× fairHigh so the pin has somewhere to sit when high.
  const scaleMax = Math.max(result.fairHigh * 1.8, result.total * 1.05);
  const pct = (n: number) => Math.min(100, Math.max(0, (n / scaleMax) * 100));
  const pinPct = pct(result.total);

  const isFair = result.verdict === 'fair';

  return (
    <div className="mt-12">
      {/* Headline */}
      <div className="text-center">
        <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111]">
          <span className="size-2 rounded-full bg-[#d01111]" />
          Live result · {result.tradeName}
        </p>
        <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl">
          {isFair ? (
            <>Your quote sits <span className="italic text-green-600">within the fair range</span>.</>
          ) : (
            <>Your quote sits <span className="italic text-[#d01111]">{result.pctAbove}% above</span> the fair range.</>
          )}
        </h2>
        <p className="mt-3 text-sm text-zinc-500">
          Here&apos;s what we found, in plain English. Nothing has been sent to any contractor.
        </p>
      </div>

      {/* Fair-price gauge */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-black">The fair-price gauge</h3>
            <p className="text-xs text-zinc-500">Where this quote sits relative to fair pricing for this work</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
              isFair ? 'bg-green-50 text-green-700' : result.verdict === 'high' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {isFair ? 'Fair' : result.verdict === 'high' ? 'High' : 'Above market'}
          </span>
        </div>

        {/* Bar + pin */}
        <div className="relative mt-10 pb-6 pt-8">
          <div
            className="absolute -top-0 z-10 -translate-x-1/2"
            style={{ left: `${pinPct}%` }}
          >
            <span className="block whitespace-nowrap rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white">
              Your quote · {money(result.total)}
            </span>
            <span className="mx-auto block h-3 w-px bg-black" />
          </div>
          <div className="flex h-4 w-full overflow-hidden rounded-full">
            <div className="bg-green-500" style={{ width: `${pct(result.fairLow)}%` }} />
            <div className="bg-amber-400" style={{ width: `${pct(result.fairHigh) - pct(result.fairLow)}%` }} />
            <div className="flex-1 bg-[#d01111]" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-zinc-500">
            <span><span className="font-semibold text-black">{money(result.fairLow)}</span> low</span>
            <span><span className="font-semibold text-black">{money(result.fairLow)}–{money(result.fairHigh)}</span> typical fair range</span>
            <span><span className="font-semibold text-black">{money(Math.round(result.fairHigh * 1.5))}+</span> red flag</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-green-500" /> Fair</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-400" /> High but defensible</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#d01111]" /> Significantly above market</span>
        </div>
        <p className="mt-3 rounded-lg bg-[#fafafa] px-3 py-2 text-[11px] text-zinc-500">
          <span className="font-semibold uppercase tracking-wide text-[#d01111]">Based on</span>{' '}
          {result.basedOn}
        </p>
      </div>

      {/* Line by line */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-bold text-black">Line by line</h3>
        <p className="text-xs text-zinc-500">What you&apos;ve been quoted vs. what this work typically costs</p>

        <ul className="mt-4 flex flex-col">
          {result.lines.map((line, i) => (
            <li key={i} className={`flex items-start justify-between gap-4 py-4 ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-black">{line.item}{line.qty > 1 ? ` ×${line.qty}` : ''}</p>
                {line.benchmarkLabel && (
                  <p className="mt-0.5 text-xs text-zinc-500">Benchmark: {line.benchmarkLabel}</p>
                )}
                {line.flag !== 'no_benchmark' && line.flag !== 'in_range' && (
                  <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${flagStyles[line.flag].cls}`}>
                    {flagStyles[line.flag].label(line)}
                  </span>
                )}
                {line.flag === 'in_range' && (
                  <span className="mt-1.5 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                    In range
                  </span>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-base font-bold text-black">{money(line.cost)}</p>
                <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                  {line.marketHigh !== undefined ? `Market ${money(line.marketLow!)}–${money(line.marketHigh)}` : 'No benchmark'}
                </p>
              </div>
            </li>
          ))}
          <li className="flex items-center justify-between border-t-2 border-gray-200 pt-4">
            <p className="text-base font-bold text-black">Total quoted</p>
            <div className="text-right">
              <p className="text-xl font-bold text-black">{money(result.total)}</p>
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                Fair range {money(result.fairLow)}–{money(result.fairHigh)}
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* Questions to ask */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-bold text-black">Three questions to ask before you pay</h3>
        <p className="text-xs text-zinc-500">
          Use these word-for-word. They&apos;re not confrontational — they&apos;re reasonable.
          {result.aiGenerated && ' Tailored to your quote.'}
        </p>
        <ol className="mt-4 flex flex-col">
          {result.questions.map((q, i) => (
            <li key={i} className={`flex gap-4 py-4 ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
              <span className="text-xl font-bold text-[#d01111]">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="text-sm font-semibold leading-relaxed text-black">{q.question}</p>
                <p className="mt-1 text-xs text-zinc-500">{q.why}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* How we know this */}
      <div className="mt-10 text-center">
        <h3 className="text-lg font-bold text-black">How we know this</h3>
        <p className="text-xs text-zinc-500">Every number on this page is sourced. Here&apos;s where it came from.</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Price benchmarks', body: `Kraftec's editorial price benchmarks for ${result.tradeName}, kept current by our team.` },
          { title: 'Verified jobs', body: 'Real completed jobs on Kraftec, with the actual price paid on record.' },
          { title: 'Outcomes confirmed', body: 'Pricing reflects work that held up at 90 days and 12 months.' },
          { title: 'No paid placement', body: 'No contractor pays us to influence your result. Ever.' },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-gray-200 bg-[#fafafa] p-4 text-left">
            <p className="flex items-center justify-between text-sm font-semibold text-black">
              {card.title}
              <span className="size-2 rounded-full bg-green-500" />
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{card.body}</p>
          </div>
        ))}
      </div>

      {/* Second opinion CTA */}
      <div className="mt-8 flex flex-col gap-5 rounded-2xl bg-black px-8 py-7 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Want a no-pressure second opinion?</h3>
          <p className="mt-1 text-sm text-white/60">
            We can connect you with one or two honest pros in your area for a fresh look. Free for you.
            Your number is never sold.
          </p>
        </div>
        <Link
          href="/find-pro"
          className="shrink-0 self-start rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95 md:self-auto"
        >
          Get a second look →
        </Link>
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-semibold text-[#d01111] hover:underline"
        >
          ← Check another quote
        </button>
      </div>
    </div>
  );
}
