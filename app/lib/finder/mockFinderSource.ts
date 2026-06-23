import type { FinderSnapshot, FinderSource, ProPresence } from '@/app/types/finder';
import { fetchRoute, pointAlongPath } from './routes';

// Mock implementation of a FinderSource. It seeds verified pros around Irvine,
// then animates the `en_route` ones along their routes on a timer so the map
// *feels* live — this exercises the exact rendering path the real GPS feed will
// drive later. Swap this module for a `realtimeFinderSource` (same FinderSource
// shape) and the map, list, and floating cards keep working unchanged.

const HOME = { lat: 33.6846, lng: -117.8265 }; // "YOU" — searched area center

const seed: ProPresence[] = [
  {
    id: 'martinez-reyes', name: 'Martinez & Reyes', initials: 'MR', trade: 'HVAC', rating: '5.0',
    status: 'en_route', statusLabel: 'On the way · 12 min', meta: '0.8 mi · 12 min ETA',
    position: { lat: 33.715, lng: -117.79 }, etaMinutes: 12, distanceMiles: 0.8,
    destination: { lat: 33.678, lng: -117.821 }, progress: 0,
  },
  {
    id: 'desert-cool', name: 'Desert Cool', initials: 'DC', trade: 'HVAC', rating: '4.9',
    status: 'en_route', statusLabel: 'On the way · 18 min', meta: '1.4 mi · 18 min ETA',
    position: { lat: 33.655, lng: -117.865 }, etaMinutes: 18, distanceMiles: 1.4,
    destination: { lat: 33.69, lng: -117.83 }, progress: 0.2,
  },
  {
    id: 'valley-air', name: 'Valley Air', initials: 'VA', trade: 'HVAC', rating: '4.8',
    status: 'finishing', statusLabel: 'Finishing job · 35 min', meta: '2.1 mi away',
    position: { lat: 33.712, lng: -117.842 }, etaMinutes: 35, distanceMiles: 2.1,
  },
  {
    id: 'sunwest', name: 'Sunwest', initials: 'SW', trade: 'HVAC', rating: '4.9',
    status: 'available', statusLabel: 'Available now', meta: '3.0 mi · 22 min ETA',
    position: { lat: 33.652, lng: -117.802 }, etaMinutes: 22, distanceMiles: 3.0,
  },
];

const TICK_MS = 120;
const STEP = 0.004; // progress per tick → ~36s for a full route

let pros: ProPresence[] = seed.map((p) => ({
  ...p,
  // Start with a straight-line path so cars move even before Directions resolves.
  routePath: p.destination ? [p.position, p.destination] : undefined,
}));

const listeners = new Set<(s: FinderSnapshot) => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function snapshot(): FinderSnapshot {
  return {
    center: HOME,
    pros: pros.map((p) => ({ ...p, position: { ...p.position } })),
    jobsInProgress: pros.filter((p) => p.status === 'en_route' || p.status === 'finishing').length,
  };
}

function emit() {
  const s = snapshot();
  listeners.forEach((l) => l(s));
}

function tick() {
  pros = pros.map((p) => {
    if (p.status !== 'en_route' || !p.routePath) return p;
    const progress = (p.progress ?? 0) + STEP;
    const looped = progress >= 1 ? 0 : progress; // loop the demo drive
    return { ...p, progress: looped, position: pointAlongPath(p.routePath, looped) };
  });
  emit();
}

function start() {
  if (timer) return;
  timer = setInterval(tick, TICK_MS);
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

/**
 * Upgrade each en_route pro's straight-line path to a real road-following route.
 * Called from inside the map (where the Google Directions library is available).
 * Idempotent and safe to call once the routes library has loaded.
 */
export async function resolveRoutes(service: google.maps.DirectionsService) {
  await Promise.all(
    pros.map(async (p) => {
      if (p.status !== 'en_route' || !p.destination) return;
      const path = await fetchRoute(service, p.position, p.destination);
      pros = pros.map((q) => (q.id === p.id ? { ...q, routePath: path } : q));
    }),
  );
  emit();
}

export const mockFinderSource: FinderSource = {
  subscribe(listener) {
    listeners.add(listener);
    listener(snapshot());
    if (listeners.size === 1) start();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) stop();
    };
  },
};
