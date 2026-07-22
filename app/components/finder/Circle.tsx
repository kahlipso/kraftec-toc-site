'use client';

import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { LatLng } from '@/app/types/finder';

const MILES_TO_METERS = 1609.34;

// vis.gl's core has no <Circle> component, so we wrap google.maps.Circle
// (same pattern the old Polyline wrapper used). Draws a pro's coverage radius.
export default function Circle({
  center,
  radiusMiles,
  color,
  dimmed = false,
}: {
  center: LatLng;
  radiusMiles: number;
  color: string;
  dimmed?: boolean;
}) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    const circle = new google.maps.Circle({
      map,
      center,
      radius: radiusMiles * MILES_TO_METERS,
      clickable: false,
      strokeColor: dimmed ? '#9ca3af' : color,
      strokeOpacity: dimmed ? 0.4 : 0.7,
      strokeWeight: 1.5,
      fillColor: dimmed ? '#9ca3af' : color,
      fillOpacity: dimmed ? 0.04 : 0.09,
    });
    circleRef.current = circle;

    return () => {
      circle.setMap(null);
      circleRef.current = null;
    };
  }, [map, center.lat, center.lng, radiusMiles, color, dimmed]);

  return null;
}
