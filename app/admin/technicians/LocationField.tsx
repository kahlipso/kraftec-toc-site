'use client';

import { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  usePlacesAutocomplete,
  type SelectedPlace,
} from '@/app/lib/finder/usePlacesAutocomplete';
import type { LatLng } from '@/app/types/finder';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const field = 'mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm';
const label = 'block text-sm font-medium';

// Sets a pro's base location: an address search resolves lat/lng (the center
// of their coverage circle on the map) and suggests a value for the visible
// "location" display text, which stays independently editable. Left alone,
// it keeps whatever coordinates the form was given (editing a pro without
// touching this field is a no-op on lat/lng).
function AddressSearch({
  onResolved,
}: {
  onResolved: (place: SelectedPlace) => void;
}) {
  const { containerRef, value, setValue, suggestions, open, setOpen, choose } =
    usePlacesAutocomplete(onResolved);

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Search an address to set the map location…"
        className={field}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-left shadow-lg">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => choose(s)}
                className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-gray-50"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function LocationField({
  defaultLat,
  defaultLng,
  defaultLocation,
}: {
  defaultLat?: number;
  defaultLng?: number;
  defaultLocation?: string;
}) {
  const [coords, setCoords] = useState<LatLng | null>(
    defaultLat !== undefined && defaultLng !== undefined ? { lat: defaultLat, lng: defaultLng } : null,
  );
  const [locationText, setLocationText] = useState(defaultLocation ?? '');

  if (!apiKey) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Location <span className="font-normal text-zinc-400">City, State</span>
          <input name="location" required defaultValue={defaultLocation} className={field} />
        </label>
        <label className={label}>
          Latitude<input name="lat" required defaultValue={defaultLat} inputMode="decimal" className={field} />
        </label>
        <label className={label}>
          Longitude<input name="lng" required defaultValue={defaultLng} inputMode="decimal" className={field} />
        </label>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div>
        <span className={label}>Location</span>
        <AddressSearch
          onResolved={({ location, label: resolvedLabel }) => {
            setCoords(location);
            setLocationText(resolvedLabel);
          }}
        />
        <label className="mt-3 block text-sm font-medium">
          Display location <span className="font-normal text-zinc-400">shown on the pro&apos;s profile</span>
          <input
            name="location"
            required
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            className={field}
          />
        </label>
        <p className="mt-2 text-xs text-zinc-400">
          {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'No coordinates set yet — search an address above.'}
        </p>
        <input type="hidden" name="lat" value={coords?.lat ?? ''} />
        <input type="hidden" name="lng" value={coords?.lng ?? ''} />
      </div>
    </APIProvider>
  );
}
