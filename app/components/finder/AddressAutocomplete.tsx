'use client';

import { usePlacesAutocomplete } from '@/app/lib/finder/usePlacesAutocomplete';
import type { LatLng } from '@/app/types/finder';

// The hero's address bar. All the Google logic lives in usePlacesAutocomplete —
// this file is only the look: the pill input, the Search button, the dropdown.
export default function AddressAutocomplete({
  onSelect,
}: {
  onSelect: (location: LatLng, label: string) => void;
}) {
  const { containerRef, value, setValue, suggestions, open, setOpen, choose } =
    usePlacesAutocomplete(onSelect);

  return (
    <div ref={containerRef} className="relative mt-6 w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pl-4 shadow-sm focus-within:border-gray-300">
        <svg className="size-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Enter your address to see pros near you…"
          className="flex-1 bg-transparent text-sm text-black placeholder:text-gray-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => suggestions[0] && choose(suggestions[0])}
          className="rounded-full bg-[#d01111] px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95"
        >
          Search
        </button>
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