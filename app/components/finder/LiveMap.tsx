'use client';

import { useEffect, useRef } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import type { LatLng, ProPresence, ProStatus } from '@/app/types/finder';
import Circle from './Circle';

// Presentational map: renders a center + a list of pros. It is source-agnostic —
// it just draws whatever it's given, so mock and live data render identically.

export type MapPro = ProPresence & { inRange: boolean };

const statusColors: Record<ProStatus, string> = {
  idle: '#22c55e', // green-500
  working: '#3b82f6', // blue-500
  finishing: '#f59e0b', // amber-500
};

const badgeClasses: Record<ProStatus, string> = {
  idle: 'bg-green-500',
  working: 'bg-blue-500',
  finishing: 'bg-amber-500',
};

const pulseBorderClasses: Record<ProStatus, string> = {
  idle: '',
  working: 'border-blue-500/50',
  finishing: 'border-amber-500/50',
};

// idle pros are stationary and available — no pulse. working/finishing pulse
// at different speeds so the two states read as visually distinct at a glance.
const pulseDurationSec: Record<ProStatus, number> = {
  idle: 0,
  working: 1.8,
  finishing: 2.6,
};

function HomeMarker() {
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-black ring-4 ring-black/10">
      <span className="size-2.5 rounded-full bg-white" />
    </span>
  );
}

// The marker sits at the exact center of its pro's coverage circle, so an
// initials badge (same look as the "Available near you" list avatars) is what
// ties a given circle back to the right pro — color still carries status.
function ProMarker({ pro }: { pro: MapPro }) {
  const badgeClass = pro.inRange ? badgeClasses[pro.status] : 'bg-gray-400';
  const showPulse = pro.inRange && pulseDurationSec[pro.status] > 0;

  return (
    <span className="relative flex size-8 items-center justify-center" title={pro.name}>
      {showPulse && (
        <span
          className={`absolute inset-0 rounded-full border-2 ${pulseBorderClasses[pro.status]}`}
          style={{ animation: `pulseRing ${pulseDurationSec[pro.status]}s ease-out infinite` }}
        />
      )}
      <span
        className={`flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md ring-2 ring-white ${badgeClass}`}
      >
        {pro.initials}
      </span>
    </span>
  );
}

/** Pans/zooms the map when the searched center changes (not on initial load —
 * the map's own defaultZoom should hold until the user actually searches). */
function PanTo({ center }: { center: LatLng }) {
  const map = useMap();
  const { lat, lng } = center;
  // Captured once, from the very first render — comparing against this (rather
  // than a "have I run yet" flag) is immune to Strict Mode's dev-only double
  // effect invocation, which would otherwise treat the real first run as the
  // second one and zoom in immediately on load.
  const initialCenter = useRef({ lat, lng }).current;
  useEffect(() => {
    if (!map) return;
    if (lat === initialCenter.lat && lng === initialCenter.lng) return;
    map.panTo({ lat, lng });
    map.setZoom(14);
  }, [map, lat, lng, initialCenter]);
  return null;
}

export default function LiveMap({
  center,
  pros,
  mapId,
  onProClick,
}: {
  center: LatLng;
  pros: MapPro[];
  mapId: string;
  onProClick: (pro: MapPro) => void;
}) {
  return (
    <Map
      mapId={mapId}
      defaultCenter={center}
      defaultZoom={11}
      gestureHandling="cooperative"
      disableDefaultUI
      clickableIcons={false}
      className="size-full"
    >
      <PanTo center={center} />

      {pros.map((pro) => (
        <Circle
          key={`radius-${pro.id}`}
          center={pro.position}
          radiusMiles={pro.radiusMiles}
          color={statusColors[pro.status]}
          dimmed={!pro.inRange}
        />
      ))}

      <AdvancedMarker position={center} title="You">
        <HomeMarker />
      </AdvancedMarker>

      {pros.map((pro) => (
        <AdvancedMarker
          key={pro.id}
          position={pro.position}
          title={pro.name}
          onClick={() => onProClick(pro)}
        >
          <ProMarker pro={pro} />
        </AdvancedMarker>
      ))}
    </Map>
  );
}
