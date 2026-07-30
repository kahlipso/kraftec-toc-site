'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLng } from '@/app/types/finder';

/**
 * The visitor's device location, used to re-center the finder map off the
 * default market.
 *
 * The prompt is deliberately NOT fired on mount for first-time visitors: an
 * unexplained permission dialog on page load gets denied, and a denial is
 * sticky per-origin. So the button owns the first ask, and only a visitor who
 * already granted permission gets re-located silently on later visits.
 *
 * Needs a secure context (https or localhost) — on plain http the browser
 * rejects the call and we land in `error`.
 */
export type DeviceLocationStatus =
  | 'idle'
  | 'locating'
  | 'located'
  | 'denied'
  | 'unsupported'
  | 'error';

const GEO_OPTIONS: PositionOptions = {
  // Street-level precision is pointless here — the map opens at metro zoom, and
  // the coarse fix comes back far faster and without waking the GPS radio.
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 5 * 60_000,
};

export function useDeviceLocation() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<DeviceLocationStatus>('idle');
  const inFlight = useRef(false);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        inFlight.current = false;
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus('located');
      },
      (error) => {
        inFlight.current = false;
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error');
        // The UI degrades to "type your address", but a timeout and a blocked
        // origin look identical from the outside — leave the reason somewhere.
        console.warn('[finder] geolocation failed', error.code, error.message);
      },
      GEO_OPTIONS,
    );
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    if (!navigator.geolocation) {
      setStatus('unsupported');
      return;
    }
    // Permissions API is missing on older Safari; there, everyone taps the button.
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((permission) => {
        if (permission.state === 'granted') request();
      })
      .catch(() => {});
  }, [request]);

  return { location, status, request };
}
