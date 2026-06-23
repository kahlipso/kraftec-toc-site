'use client';

import { useEffect, useState } from 'react';
import type { FinderSnapshot } from '@/app/types/finder';
import { mockFinderSource } from './mockFinderSource';

// The single seam between the UI and the data source. Today it reads from the
// mock source; for the live phase, swap this import for `realtimeFinderSource`
// and every consumer (map, list, floating cards) updates automatically.
const source = mockFinderSource;

function initialSnapshot(): FinderSnapshot {
  // `subscribe` synchronously delivers the current snapshot; grab it and detach.
  let snap!: FinderSnapshot;
  const unsubscribe = source.subscribe((s) => {
    snap = s;
  });
  unsubscribe();
  return snap;
}

export function useFinder(): { snapshot: FinderSnapshot } {
  const [snapshot, setSnapshot] = useState<FinderSnapshot>(initialSnapshot);

  useEffect(() => source.subscribe(setSnapshot), []);

  return { snapshot };
}
