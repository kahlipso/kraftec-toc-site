'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import type { LatLng } from '@/app/types/finder';

type Suggestion = {
  id: string;
  label: string;
  prediction: google.maps.places.PlacePrediction;
};

// Address search with Google Places (New) autocomplete. As the user types we
// fetch suggestions; picking one resolves its lat/lng and calls onSelect, which
// the parent uses to recenter the map and filter nearby pros.
//
// Degrades gracefully: with no Places library available (no API key), it renders
// a plain, non-interactive input so the page still works.
export default function AddressAutocomplete({
  onSelect,
}: {
  onSelect: (location: LatLng, label: string) => void;
}) {
  const placesLib = useMapsLibrary('places');
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fresh session token per editing session (reset after each selection).
  useEffect(() => {
    if (placesLib && !sessionToken.current) {
      sessionToken.current = new placesLib.AutocompleteSessionToken();
    }
  }, [placesLib]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Debounced suggestion fetch. All state updates happen inside the debounced
  // callback (never synchronously in the effect body).
  useEffect(() => {
    if (!placesLib) return;
    const input = value.trim();
    const handle = setTimeout(async () => {
      if (input.length < 3) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      try {
        const { suggestions: results } =
          await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            sessionToken: sessionToken.current ?? undefined,
            includedRegionCodes: ['us'],
          });
        setSuggestions(
          results
            .filter((s) => s.placePrediction)
            .map((s) => ({
              id: s.placePrediction!.placeId,
              label: s.placePrediction!.text.text,
              prediction: s.placePrediction!,
            })),
        );
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [value, placesLib]);

  async function choose(suggestion: Suggestion) {
    setValue(suggestion.label);
    setOpen(false);
    setSuggestions([]);
    try {
      const place = suggestion.prediction.toPlace();
      await place.fetchFields({ fields: ['location', 'formattedAddress'] });
      if (place.location) {
        onSelect({ lat: place.location.lat(), lng: place.location.lng() }, suggestion.label);
      }
    } catch {
      /* ignore resolve failures */
    }
    // Start a new billing session for the next search.
    sessionToken.current = placesLib ? new placesLib.AutocompleteSessionToken() : null;
  }

  return (
    <div ref={containerRef} className="relative mt-8 w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1.5 pl-5 shadow-sm focus-within:border-gray-300">
        <svg className="size-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          className="rounded-full bg-[#d01111] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95"
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
