'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useFinder } from '@/app/lib/finder/useFinder';
import { resolveRoutes } from '@/app/lib/finder/mockFinderSource';
import { haversineMiles } from '@/app/lib/finder/geo';
import type { LatLng, ProPresence } from '@/app/types/finder';
import LiveMap from './LiveMap';
import StaticMapFallback from './StaticMapFallback';
import AddressAutocomplete from './AddressAutocomplete';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
const hasMaps = Boolean(apiKey && mapId);

const NEARBY_RADIUS_MILES = 8;

const statusStyles: Record<ProPresence['status'], { pill: string; dot: string }> = {
  available: { pill: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  finishing: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  en_route: { pill: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
};

type Searched = { loc: LatLng; label: string };

export default function FinderExperience() {
  const { snapshot } = useFinder();
  const [searched, setSearched] = useState<Searched | null>(null);

  const onDirectionsService = useCallback(
    (service: google.maps.DirectionsService) => resolveRoutes(service),
    [],
  );

  // When an address is chosen, the searched point becomes the map center and we
  // only show pros within range of it; otherwise show everyone around the default.
  const center = searched?.loc ?? snapshot.center;
  const visiblePros = searched
    ? snapshot.pros.filter((p) => haversineMiles(p.position, searched.loc) <= NEARBY_RADIUS_MILES)
    : snapshot.pros;
  const jobsInProgress = visiblePros.filter(
    (p) => p.status === 'en_route' || p.status === 'finishing',
  ).length;

  const inner = (
    <>
      {/* Address search */}
      <div className="flex justify-center">
        {hasMaps ? (
          <AddressAutocomplete onSelect={(loc, label) => setSearched({ loc, label })} />
        ) : (
          <div className="mt-8 flex w-full max-w-2xl items-center gap-2 rounded-full border border-gray-200 bg-white p-1.5 pl-5 shadow-sm">
            <svg className="size-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <input
              type="text"
              placeholder="Enter your address to see pros near you…"
              className="flex-1 bg-transparent text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />
            <span className="rounded-full bg-[#d01111] px-6 py-2.5 text-sm font-semibold text-white">Search</span>
          </div>
        )}
      </div>

      {/* Map + list */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Map */}
        <div className="relative h-[460px] overflow-hidden rounded-2xl border border-gray-200 bg-[#f3f3f1]">
          {hasMaps ? (
            <LiveMap
              center={center}
              pros={visiblePros}
              mapId={mapId!}
              onDirectionsService={onDirectionsService}
            />
          ) : (
            <StaticMapFallback />
          )}

          {/* Floating overlay cards — bound to the live snapshot */}
          <div className="pointer-events-none absolute left-3 top-3 z-30 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-black">
              <span className="size-1.5 rounded-full bg-green-500" />
              {visiblePros.length} pros nearby
            </p>
            <p className="text-[11px] text-gray-500">{searched ? searched.label : 'Avg ETA · 14 min'}</p>
          </div>
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <span className="flex items-center gap-1.5 text-xs font-medium text-black">
              <span className="size-1.5 rounded-full bg-green-500" />
              {jobsInProgress} jobs in progress near you
            </span>
            <span className="text-[11px] font-bold tracking-wide text-[#d01111]">LIVE</span>
          </div>
        </div>

        {/* Available near you */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Available near you</p>
            <button className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Trades
              <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m3 4.5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {visiblePros.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
              <p className="text-sm font-medium text-black">No pros near {searched?.label ?? 'you'} yet</p>
              <p className="mt-1 text-xs text-gray-500">We&apos;re expanding — try a nearby city or check back soon.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visiblePros.map((pro) => {
                const s = statusStyles[pro.status];
                return (
                  <div key={pro.id} className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
                        {pro.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-black">{pro.name}</p>
                        <p className="text-xs text-gray-500">★ {pro.rating} · {pro.trade}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${s.pill}`}>
                        <span className={`size-1.5 rounded-full ${s.dot}`} />
                        {pro.statusLabel}
                      </span>
                      <span className="text-[11px] text-gray-500">{pro.meta}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link href="/find-pro" className="mt-4 text-sm font-semibold text-[#d01111] hover:underline">
            See all available →
          </Link>
        </div>
      </div>
    </>
  );

  // APIProvider must wrap both the autocomplete and the map so they share the
  // loaded Maps JS context. Without a key, render the inert fallback tree.
  return hasMaps ? <APIProvider apiKey={apiKey!}>{inner}</APIProvider> : inner;
}
