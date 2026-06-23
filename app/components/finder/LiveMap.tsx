'use client';

import { useEffect } from 'react';
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import type { LatLng, ProPresence } from '@/app/types/finder';
import Polyline from './Polyline';

// Presentational map: renders a center + a list of pros. It is source-agnostic —
// it just draws whatever it's given, so mock and live data render identically.

function HomeMarker() {
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-black ring-4 ring-black/10">
      <span className="size-2.5 rounded-full bg-white" />
    </span>
  );
}

function ProMarker({ pro }: { pro: ProPresence }) {
  if (pro.status === 'en_route') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-black shadow-md ring-1 ring-black/5">
        <span className="text-sm leading-none">🚚</span>
        {pro.etaMinutes} min
      </span>
    );
  }
  return (
    <span className="flex size-4 rounded-full bg-[#d01111]/85 ring-4 ring-[#d01111]/15" title={pro.name} />
  );
}

/** Pans/zooms the map when the searched center changes. */
function PanTo({ center }: { center: LatLng }) {
  const map = useMap();
  const { lat, lng } = center;
  useEffect(() => {
    if (!map) return;
    map.panTo({ lat, lng });
    map.setZoom(14);
  }, [map, lat, lng]);
  return null;
}

/** Inside APIProvider: hands a DirectionsService to the caller once loaded. */
function DirectionsBridge({ onReady }: { onReady: (s: google.maps.DirectionsService) => void }) {
  const routesLib = useMapsLibrary('routes');
  useEffect(() => {
    if (!routesLib) return;
    onReady(new routesLib.DirectionsService());
  }, [routesLib, onReady]);
  return null;
}

export default function LiveMap({
  center,
  pros,
  mapId,
  onDirectionsService,
}: {
  center: LatLng;
  pros: ProPresence[];
  mapId: string;
  onDirectionsService: (service: google.maps.DirectionsService) => void;
}) {
  return (
    <Map
      mapId={mapId}
      defaultCenter={center}
      defaultZoom={13}
      gestureHandling="cooperative"
      disableDefaultUI
      clickableIcons={false}
      className="size-full"
    >
      <DirectionsBridge onReady={onDirectionsService} />
      <PanTo center={center} />

      {pros.map((pro) =>
        pro.status === 'en_route' && pro.routePath ? (
          <Polyline key={`route-${pro.id}`} path={pro.routePath} />
        ) : null,
      )}

      <AdvancedMarker position={center} title="You">
        <HomeMarker />
      </AdvancedMarker>

      {pros.map((pro) => (
        <AdvancedMarker key={pro.id} position={pro.position} title={pro.name}>
          <ProMarker pro={pro} />
        </AdvancedMarker>
      ))}
    </Map>
  );
}
