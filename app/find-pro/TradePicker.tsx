'use client';

import { useState } from 'react';
import Image from 'next/image';
import { trades } from '@/app/lib/trades';

// `initialTrade` comes from the page, which read it out of the URL's ?category=
// param. That's how a trade picked on the home page arrives here pre-selected.
// When the page is opened from the navbar there's no param, so it's null and
// nothing starts highlighted.
export default function TradePicker({ initialTrade }: { initialTrade: string | null }) {
  const [selected, setSelected] = useState<string | null>(initialTrade);
  const [address, setAddress] = useState('');
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);

  const selectedTrade = trades.find((t) => t.slug === selected);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (address.trim()) setSubmittedFor(address.trim());
  }

  return (
    <div className="mt-10">
      <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111]">
        <span className="size-2 rounded-full bg-[#d01111]" />
        What trade do you need?
      </p>

      {/* Trade tiles */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {trades.map((trade) => {
          const isSelected = selected === trade.slug;
          return (
            <button
              key={trade.slug}
              type="button"
              onClick={() => setSelected(trade.slug)}
              aria-pressed={isSelected}
              className={`relative flex w-[78px] h-[78px] flex-col items-center gap-2 rounded-2xl border p-3 transition ${
                isSelected
                  ? 'border-[#d01111] bg-[#d01111]/5'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isSelected && (
                <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[#d01111] text-white">
                  <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m2.5 6.5 2.5 2.5 4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <Image
                src={`/category-icons/${trade.slug}.svg`}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="size-9"
              />
              <span className={`text-[11px] font-medium ${isSelected ? 'text-[#d01111]' : 'text-zinc-600'}`}>
                {trade.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Address bar — only appears once a trade is selected */}
      {selectedTrade && (
        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-2xl gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 focus-within:border-gray-400">
            <svg className="size-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address or ZIP"
              className="flex-1 bg-transparent text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95"
          >
            Find pros →
          </button>
        </form>
      )}

      {/* Search acknowledgment (the matching results view is a separate frame) */}
      {submittedFor && selectedTrade && (
        <p className="mt-4 text-center text-sm text-zinc-500">
          Finding verified <span className="font-medium text-black">{selectedTrade.name}</span> pros near{' '}
          <span className="font-medium text-black">{submittedFor}</span>…
        </p>
      )}
    </div>
  );
}
