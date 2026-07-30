'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APIProvider } from '@vis.gl/react-google-maps';
import { haversineMiles } from '@/app/lib/finder/geo';
import { useCenterCity } from '@/app/lib/finder/useCenterCity';
import { useDeviceLocation } from '@/app/lib/finder/useDeviceLocation';
import type { FinderSnapshot, LatLng, ProPresence } from '@/app/types/finder';
import LiveMap, { type MapPro } from './LiveMap';
import StaticMapFallback from './StaticMapFallback';
import AddressAutocomplete from './AddressAutocomplete';
import OutOfRangeModal from './OutOfRangeModal';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
const hasMaps = Boolean(apiKey && mapId);

const statusStyles: Record<ProPresence['status'], { pill: string; dot: string }> = {
  idle: { pill: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  finishing: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  working: { pill: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
};

type Searched = { loc: LatLng; label: string; city: string | null };

// There is no live GPS/telemetry feed yet, so ETA is derived from straight-line
// distance at an assumed city-driving speed rather than stored per pro. Replace
// this with a routing/dispatch estimate once contractor tracking exists.
const AVG_SPEED_MPH = 25;

function etaMinutesFor(distanceMiles: number) {
  return Math.max(5, Math.round((distanceMiles / AVG_SPEED_MPH) * 60));
}

function proHref(id: string, searched: Searched | null) {
  if (!searched) return `/pro/${id}`;
  const params = new URLSearchParams({
    lat: String(searched.loc.lat),
    lng: String(searched.loc.lng),
    label: searched.label,
  });
  return `/pro/${id}?${params.toString()}`;
}

/**
 * Reports the city Google labels the current map center (null when it can't be
 * named). Renders nothing — it only exists so the lookup hook runs inside
 * <APIProvider>, which is where the Maps libraries are available.
 */
function CenterCityWatcher({
  center,
  fallback,
  onResolve,
}: {
  center: LatLng;
  fallback: string;
  onResolve: (city: string | null) => void;
}) {
  const city = useCenterCity(center, fallback);
  useEffect(() => onResolve(city), [city, onResolve]);
  return null;
}

export default function FinderExperience({ snapshot }: { snapshot: FinderSnapshot }) {
  const router = useRouter();
  const device = useDeviceLocation();
  const [searched, setSearched] = useState<Searched | null>(null);
  const [outOfRangePro, setOutOfRangePro] = useState<ProPresence | null>(null);
  // The headline names the map's city. A searched address knows its own city
  // (Places gives it to us), so that wins outright; otherwise we show whatever
  // the center lookup last resolved, starting from the server-derived city.
  const [geocodedCity, setGeocodedCity] = useState<string | null>(snapshot.centerCity);
  const city = searched?.city ?? geocodedCity;

  // Every pro is shown; each is individually marked in/out of range of the
  // searched address based on its own coverage radius (no flat cutoff).
  //
  // Center precedence: an address the visitor typed beats the location their
  // device reported, which beats the default market from the server.
  const center = searched?.loc ?? device.location ?? snapshot.center;
  const visiblePros: MapPro[] = useMemo(
    () =>
      snapshot.pros.map((p) => {
        // Measured from the searched address once there is one, otherwise from
        // the default map center — so the numbers always match what's on screen.
        const distanceMiles = haversineMiles(p.position, center);
        return {
          ...p,
          distanceMiles,
          etaMinutes: etaMinutesFor(distanceMiles),
          inRange: !searched || distanceMiles <= p.radiusMiles,
        };
      }),
    [snapshot.pros, searched, center],
  );
  const inRangePros = visiblePros.filter((p) => p.inRange);
  const jobsInProgress = inRangePros.filter(
    (p) => p.status === 'working' || p.status === 'finishing',
  ).length;
  const avgEta = inRangePros.length
    ? Math.round(inRangePros.reduce((sum, p) => sum + p.etaMinutes, 0) / inRangePros.length)
    : null;

  // The button both asks for permission the first time and, once a visitor has
  // searched an address, takes them back to where they actually are.
  const usingDeviceLocation = device.location !== null && !searched;
  const deviceButton = usingDeviceLocation
    ? { label: 'Centered on your current location', disabled: true }
    : device.status === 'locating'
      ? { label: 'Finding your location…', disabled: true }
      : device.status === 'denied'
        ? { label: 'Location blocked — enter your address above', disabled: true }
        : device.status === 'unsupported'
          ? { label: 'Location unavailable on this device', disabled: true }
          : device.status === 'error'
            ? { label: 'Couldn’t get your location — try again', disabled: false }
            : { label: 'Use my current location', disabled: false };

  function requestDeviceLocation() {
    // Drop the searched address, or it would keep winning the center.
    setSearched(null);
    device.request();
  }

  function handleProClick(pro: MapPro) {
    if (pro.inRange) {
      router.push(proHref(pro.id, searched));
    } else {
      setOutOfRangePro(pro);
    }
  }

  const inner = (
    <>
      {/* Heading — names whichever city the map below is centered on */}
      <div className="relative mx-auto w-full max-w-5xl px-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-4xl font-bold tracking-tight text-black leading-tight max-w-3xl">
            Find your pro in{' '}
            <span className="italic text-[#d01111]">{city ?? 'your area'}</span> right now.
          </h1>
        </div>
      </div>

      {/* Address search — stays in the centered column */}
      <div className="flex flex-col items-center px-6">
        {hasMaps ? (
          <>
            <CenterCityWatcher
              center={center}
              fallback={snapshot.centerCity}
              onResolve={setGeocodedCity}
            />
            <AddressAutocomplete
              onSelect={({ location, label, city: placeCity }) =>
                setSearched({ loc: location, label, city: placeCity })
              }
            />
            <button
              type="button"
              onClick={requestDeviceLocation}
              disabled={deviceButton.disabled}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-[#d01111] disabled:cursor-default disabled:hover:text-gray-500"
            >
              <svg
                className={`size-3.5 ${device.status === 'locating' ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <circle cx="12" cy="12" r="7" />
                <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              {deviceButton.label}
            </button>
          </>
        ) : (
          <div className="mt-6 flex w-full max-w-2xl items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pl-4 shadow-sm">
            <svg className="size-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <input
              type="text"
              placeholder="Enter your address to see pros near you…"
              className="flex-1 bg-transparent text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />
            <span className="rounded-full bg-[#d01111] px-5 py-1.5 text-sm font-semibold text-white">Search</span>
          </div>
        )}
      </div>

      {/* Full-bleed map — a backdrop band you scroll past */}
      <div className="relative mt-8 h-[82vh] min-h-[600px] w-full overflow-hidden border-y border-gray-200 bg-[#f3f3f1]">
        {hasMaps ? (
          <LiveMap center={center} pros={visiblePros} mapId={mapId!} onProClick={handleProClick} />
        ) : (
          <StaticMapFallback />
        )}

        {/* Floating overlay cards — bound to the live snapshot */}
        <div className="pointer-events-none absolute left-6 top-4 z-30 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-black">
            <span className="size-1.5 rounded-full bg-green-500" />
            {inRangePros.length} pros nearby
          </p>
          <p className="text-[11px] text-gray-500">
            {searched ? searched.label : avgEta ? `Avg ETA · ${avgEta} min` : 'Enter an address'}
          </p>
        </div>
        <div className="pointer-events-none absolute bottom-4 left-6 z-30 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
          <span className="flex items-center gap-1.5 text-xs font-medium text-black">
            <span className="size-1.5 rounded-full bg-green-500" />
            {jobsInProgress} jobs in progress near you
          </span>
          <span className="text-[11px] font-bold tracking-wide text-[#d01111]">LIVE</span>
        </div>

        {/* Available near you — floating panel over the right edge of the map */}
        <div className="absolute bottom-4 right-6 top-4 z-30 hidden w-[300px] flex-col md:flex">
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-200 bg-white/90 p-3 shadow-lg backdrop-blur">
            <div className="mb-3 flex items-center justify-between px-1">
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
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                {visiblePros.map((pro) => {
                  const s = statusStyles[pro.status];
                  const cardBody = (
                    <>
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${
                            pro.inRange ? 'bg-black' : 'bg-gray-300'
                          }`}
                        >
                          {pro.initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${pro.inRange ? 'text-black' : 'text-gray-400'}`}>{pro.name}</p>
                          <p className="text-xs text-gray-500">★ {pro.rating} · {pro.trade}</p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        {pro.inRange ? (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${s.pill}`}>
                            <span className={`size-1.5 rounded-full ${s.dot}`} />
                            {pro.statusLabel}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500">
                            <span className="size-1.5 rounded-full bg-gray-400" />
                            Not available at this address
                          </span>
                        )}
                        <span className="text-[11px] text-gray-500">
                          {pro.distanceMiles.toFixed(1)} mi
                          {pro.inRange ? ` · ${pro.etaMinutes} min ETA` : ' away'}
                        </span>
                      </div>
                    </>
                  );

                  return pro.inRange ? (
                    <Link
                      key={pro.id}
                      href={proHref(pro.id, searched)}
                      className="block shrink-0 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 hover:shadow-sm"
                    >
                      {cardBody}
                    </Link>
                  ) : (
                    <button
                      key={pro.id}
                      type="button"
                      onClick={() => setOutOfRangePro(pro)}
                      className="block shrink-0 rounded-xl border border-gray-200 bg-white p-3 text-left opacity-70 transition-colors hover:border-gray-300"
                    >
                      {cardBody}
                    </button>
                  );
                })}
              </div>
            )}

            <Link href="/find-pro" className="mt-3 px-1 text-sm font-semibold text-[#d01111] hover:underline">
              See all available →
            </Link>
          </div>
        </div>
      </div>

      {outOfRangePro && searched && (
        <OutOfRangeModal
          proName={outOfRangePro.name}
          searchedLabel={searched.label}
          onClose={() => setOutOfRangePro(null)}
        />
      )}
    </>
  );

  // APIProvider must wrap both the autocomplete and the map so they share the
  // loaded Maps JS context. Without a key, render the inert fallback tree.
  return hasMaps ? <APIProvider apiKey={apiKey!}>{inner}</APIProvider> : inner;
}
