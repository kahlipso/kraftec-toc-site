'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { pickCity } from '@/app/lib/finder/city';
import type { LatLng } from '@/app/types/finder';

/**
 * Names the city the map is centered on, so the hero headline follows the map
 * wherever the visitor sends it — their device location, or the default market.
 * Must be used inside <APIProvider>.
 *
 * A searched address doesn't need this (Places hands back its own city); this
 * covers the two centers nobody typed.
 *
 * Two ways to name a point, tried in order:
 *   1. Reverse geocoding — exact and cheapest, but it's a separate Google
 *      product ("Geocoding API") that has to be enabled AND allowed on the
 *      browser key. It is currently blocked on ours (REQUEST_DENIED).
 *   2. The nearest Place's own address — Places is already enabled (the address
 *      bar uses it), so this works today. It costs several times more per call
 *      and inherits the city of a POI a few hundred metres away, so it stays
 *      the fallback: enable Geocoding on the key and path 1 takes over silently.
 *
 * Returns null when neither can name the center — the headline says "your area"
 * rather than keep showing a city the map has already left.
 */
export function useCenterCity(center: LatLng, fallback: string): string | null {
  const geocodingLib = useMapsLibrary('geocoding');
  const placesLib = useMapsLibrary('places');
  const [city, setCity] = useState<string | null>(fallback);
  const { lat, lng } = center;

  // The server already named the first center, so that value stands until the
  // map moves. Captured from the first render (immune to Strict Mode's double
  // effect run, same reasoning as PanTo in LiveMap).
  const initialCenter = useRef({ lat, lng }).current;
  const atInitialCenter = lat === initialCenter.lat && lng === initialCenter.lng;

  useEffect(() => {
    if (!geocodingLib && !placesLib) return;
    let cancelled = false;
    // Clear first: the old city belongs to where the map used to be.
    setCity(atInitialCenter ? fallback : null);

    resolveCity({ lat, lng }, geocodingLib, placesLib).then((name) => {
      if (!cancelled && name) setCity(name);
    });

    return () => {
      cancelled = true;
    };
  }, [geocodingLib, placesLib, lat, lng, atInitialCenter, fallback]);

  return city;
}

async function resolveCity(
  center: LatLng,
  geocodingLib: google.maps.GeocodingLibrary | null,
  placesLib: google.maps.PlacesLibrary | null,
): Promise<string | null> {
  if (geocodingLib) {
    const name = await cityFromGeocoder(geocodingLib, center);
    if (name) return name;
  }
  return placesLib ? cityFromNearestPlace(placesLib, center) : null;
}

async function cityFromGeocoder(
  lib: google.maps.GeocodingLibrary,
  location: LatLng,
): Promise<string | null> {
  try {
    const { results } = await new lib.Geocoder().geocode({ location });
    return pickCity(
      results.flatMap((r) =>
        r.address_components.map((c) => ({ types: c.types, name: c.long_name })),
      ),
    );
  } catch (error) {
    // A disabled Geocoding API looks identical to "nothing happened" — say so
    // once, then let the Places fallback do its job.
    console.warn('[finder] reverse geocode unavailable; falling back to Places', error);
    return null;
  }
}

/**
 * The city of the closest Place to the center. `addressComponents` carries the
 * same locality/sublocality shape the geocoder returns, so pickCity handles
 * both. One result is all we need — the request is billed per call, not per
 * place.
 */
async function cityFromNearestPlace(
  lib: google.maps.PlacesLibrary,
  center: LatLng,
): Promise<string | null> {
  try {
    const { places } = await lib.Place.searchNearby({
      fields: ['addressComponents'],
      locationRestriction: { center, radius: 2000 },
      maxResultCount: 1,
      rankPreference: 'DISTANCE',
    });
    const components = places[0]?.addressComponents ?? [];
    return pickCity(components.map((c) => ({ types: c.types, name: c.longText })));
  } catch (error) {
    console.warn('[finder] could not name the map center', error);
    return null;
  }
}
