import type { LatLng } from '@/app/types/finder';

// Resolves road-following routes between two points using the Google Directions
// service. Results are cached in-memory per origin→destination so a pro's route
// is only fetched once per session.
//
// LIVE PHASE: replace this with a server-side Routes API call + shared cache.
// The signature (origin, dest) → LatLng[] stays the same, so callers don't change.

const cache = new Map<string, LatLng[]>();

function key(a: LatLng, b: LatLng) {
  return `${a.lat.toFixed(5)},${a.lng.toFixed(5)}->${b.lat.toFixed(5)},${b.lng.toFixed(5)}`;
}

export async function fetchRoute(
  service: google.maps.DirectionsService,
  origin: LatLng,
  destination: LatLng,
): Promise<LatLng[]> {
  const k = key(origin, destination);
  const cached = cache.get(k);
  if (cached) return cached;

  try {
    const result = await service.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    const path = result.routes[0]?.overview_path ?? [];
    const latlngs: LatLng[] = path.map((p) => ({ lat: p.lat(), lng: p.lng() }));
    const resolved = latlngs.length >= 2 ? latlngs : [origin, destination];
    cache.set(k, resolved);
    return resolved;
  } catch {
    // On any Directions failure, fall back to a straight line so the car still moves.
    const fallback = [origin, destination];
    cache.set(k, fallback);
    return fallback;
  }
}

/** Linear interpolation of a point a fraction `t` (0..1) along a polyline. */
export function pointAlongPath(path: LatLng[], t: number): LatLng {
  if (path.length === 0) return { lat: 0, lng: 0 };
  if (path.length === 1) return path[0];

  const clamped = Math.min(1, Math.max(0, t));

  // Cumulative segment lengths (planar approximation — fine over a few miles).
  const segLen: number[] = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1].lat - path[i].lat;
    const dy = path[i + 1].lng - path[i].lng;
    const len = Math.hypot(dx, dy);
    segLen.push(len);
    total += len;
  }
  if (total === 0) return path[0];

  let target = clamped * total;
  for (let i = 0; i < segLen.length; i++) {
    if (target <= segLen[i]) {
      const f = segLen[i] === 0 ? 0 : target / segLen[i];
      return {
        lat: path[i].lat + (path[i + 1].lat - path[i].lat) * f,
        lng: path[i].lng + (path[i + 1].lng - path[i].lng) * f,
      };
    }
    target -= segLen[i];
  }
  return path[path.length - 1];
}
