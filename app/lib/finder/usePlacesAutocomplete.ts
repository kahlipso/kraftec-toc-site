'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import type { LatLng } from '@/app/types/finder';

export type Suggestion = {
  id: string;
  label: string;
  prediction: google.maps.places.PlacePrediction;
};

export function usePlacesAutocomplete(onSelect: (location: LatLng, label: string) => void) {
  const placesLib = useMapsLibrary('places');
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // The reusable "engine": all the Google Places talk lives here, so any address
  // bar can use it and just supply its own look. Must be used inside <APIProvider>.
  useEffect(() => {
    if (placesLib && !sessionToken.current) {
      sessionToken.current = new placesLib.AutocompleteSessionToken();
    }
  }, [placesLib]);

  // A fresh billing "session" groups all keystrokes for one search into one charge.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // As you type (debounced 300ms), ask Google for matching addresses.
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

  // When a suggestion is picked: resolve its lat/lng, hand it to onSelect, reset.
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
    sessionToken.current = placesLib ? new placesLib.AutocompleteSessionToken() : null;
  }

  return { containerRef, value, setValue, suggestions, open, setOpen, choose, ready: !!placesLib };
}