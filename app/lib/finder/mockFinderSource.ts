import type { FinderSnapshot, FinderSource, ProPresence } from '@/app/types/finder';

// Mock implementation of a FinderSource. It seeds verified pros around Irvine,
// each with a fixed base position, a coverage radius, and a status (idle,
// working, finishing). Swap this module for a `realtimeFinderSource` (same
// FinderSource shape) and the map, list, and floating cards keep working
// unchanged.

const HOME = { lat: 33.6846, lng: -117.8265 }; // "YOU" — searched area center

const statusLabels: Record<ProPresence['status'], string> = {
  idle: 'Available now',
  working: 'On a job · 12 min',
  finishing: 'Finishing job · 35 min',
};

const seed: ProPresence[] = [
  {
    id: 'martinez-reyes', name: 'Martinez & Reyes', initials: 'MR', trade: 'HVAC', rating: '5.0',
    status: 'working', statusLabel: statusLabels.working, meta: '0.8 mi · 12 min ETA',
    position: { lat: 33.715, lng: -117.79 }, etaMinutes: 12, distanceMiles: 0.8, radiusMiles: 12,
  },
  {
    id: 'desert-cool', name: 'Desert Cool', initials: 'DC', trade: 'HVAC', rating: '4.9',
    status: 'finishing', statusLabel: statusLabels.finishing, meta: '1.4 mi away',
    position: { lat: 33.655, lng: -117.865 }, etaMinutes: 18, distanceMiles: 1.4, radiusMiles: 20,
  },
  {
    id: 'valley-air', name: 'Valley Air', initials: 'VA', trade: 'HVAC', rating: '4.8',
    status: 'idle', statusLabel: statusLabels.idle, meta: '2.1 mi away',
    position: { lat: 33.712, lng: -117.842 }, etaMinutes: 35, distanceMiles: 2.1, radiusMiles: 15,
  },
  {
    id: 'sunwest', name: 'Sunwest', initials: 'SW', trade: 'HVAC', rating: '4.9',
    status: 'idle', statusLabel: statusLabels.idle, meta: '3.0 mi · 22 min ETA',
    position: { lat: 33.652, lng: -117.802 }, etaMinutes: 22, distanceMiles: 3.0, radiusMiles: 18,
  },
];

const listeners = new Set<(s: FinderSnapshot) => void>();

function snapshot(): FinderSnapshot {
  return {
    center: HOME,
    pros: seed.map((p) => ({ ...p, position: { ...p.position } })),
    jobsInProgress: seed.filter((p) => p.status === 'working' || p.status === 'finishing').length,
  };
}

export const mockFinderSource: FinderSource = {
  subscribe(listener) {
    listeners.add(listener);
    listener(snapshot());
    return () => {
      listeners.delete(listener);
    };
  },
};
