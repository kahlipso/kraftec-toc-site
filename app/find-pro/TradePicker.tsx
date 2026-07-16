'use client';

import { useState } from 'react';
import Image from 'next/image';
import { APIProvider } from '@vis.gl/react-google-maps';
import { usePlacesAutocomplete } from '@/app/lib/finder/usePlacesAutocomplete';
import { trades } from '@/app/lib/trades';
import type { LatLng } from '@/app/types/finder';
import MatchOverlay from './MatchOverlay';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Picked = { lat: number; lng: number; label: string };

// The find-pro address bar: same engine as the hero (usePlacesAutocomplete),
// different body. Reports a confirmed pick up to TradePicker via onPick.
function AddressSearch({ onPick }: { onPick: (p: Picked | null) => void }) {
  const { containerRef, value, setValue, suggestions, open, setOpen, choose } =
    usePlacesAutocomplete((loc: LatLng, label: string) => onPick({ ...loc, label }));

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 focus-within:border-gray-400">
        <svg className="size-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onPick(null); // typing again invalidates the previous pick
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Enter your address or ZIP"
          className="flex-1 bg-transparent text-sm text-black placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 text-left shadow-lg">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => choose(s)}
                className="flex w-full items-center gap-2 px-5 py-2.5 text-left text-sm text-zinc-700 hover:bg-gray-50"
              >
                <svg className="size-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TradePicker({ initialTrade }: { initialTrade: string | null }) {
  const [selected, setSelected] = useState<string | null>(initialTrade);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [searching, setSearching] = useState(false);

  const selectedTrade = trades.find((t) => t.slug === selected);
  const canSearch = Boolean(selectedTrade && picked);

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

      {/* Address search — appears once a trade is selected */}
      {selectedTrade && (
        apiKey ? (
          <APIProvider apiKey={apiKey}>
            <div className="mx-auto mt-8 flex max-w-2xl gap-3">
              <AddressSearch onPick={setPicked} />
              <button
                type="button"
                disabled={!canSearch}
                onClick={() => setSearching(true)}
                className="shrink-0 rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Find pros →
              </button>
            </div>
          </APIProvider>
        ) : (
          <div className="mx-auto mt-8 flex max-w-2xl gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3">
              <input
                placeholder="Address search requires the Maps key"
                disabled
                className="flex-1 bg-transparent text-sm text-black placeholder:text-gray-400"
              />
            </div>
            <button disabled className="shrink-0 rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white opacity-40">
              Find pros →
            </button>
          </div>
        )
      )}

      {/* The match pop-up — mounting it starts the search */}
      {searching && selectedTrade && picked && (
        <MatchOverlay
          trade={selectedTrade}
          location={picked}
          onClose={() => setSearching(false)}
        />
      )}
    </div>
  );
}