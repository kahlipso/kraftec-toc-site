'use client';

import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { LatLng } from '@/app/types/finder';

// vis.gl's core has no <Polyline> component, so we wrap google.maps.Polyline.
// Renders a dashed line (used for contractor → home routes).
export default function Polyline({
  path,
  color = '#d01111',
}: {
  path: LatLng[];
  color?: string;
}) {
  const map = useMap();
  const lineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    const line = new google.maps.Polyline({
      map,
      path,
      strokeOpacity: 0,
      icons: [
        {
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.7, strokeColor: color, scale: 3 },
          offset: '0',
          repeat: '12px',
        },
      ],
    });
    lineRef.current = line;

    return () => {
      line.setMap(null);
      lineRef.current = null;
    };
  }, [map, path, color]);

  return null;
}
