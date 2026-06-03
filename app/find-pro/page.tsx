'use client'

import { useState } from 'react';
import ProCard from '@/app/components/ProfileCard';
import AddressSearchBar from '@/app/components/AddressSearchBar';
import type { Pro } from '@/app/types/pro';

type SearchStatus = 'idle' | 'loading' | 'available' | 'unavailable' | 'invalid';

// 👇 replace this with your DB query later, e.g. const pros = await db.getPros()
const mockPros: Pro[] = [
  {
    id: 'martinez-reyes',
    name: 'Martinez & Reyes HVAC',
    type: 'Family-owned',
    yearsInBusiness: 14,
    distanceMiles: 4.2,
    tags: ['Residential', 'Repair', 'Replacement', 'Spanish'],
    checks: { licenseCurrent: true, insuranceVerified: true, backgroundChecked: true, epa608Cert: true },
    outcomeScore: 96,
    vsFair: 4,
  },
  {
    id: 'desert-cool',
    name: 'Desert Cool Services',
    type: 'Owner-operator',
    yearsInBusiness: 9,
    distanceMiles: 7.1,
    tags: ['Residential', 'Repair', 'Maintenance'],
    checks: { licenseCurrent: true, insuranceVerified: true, backgroundChecked: true, epa608Cert: true },
    outcomeScore: 94,
    vsFair: 2,
  },
  // ...add more
];

export default function FindYourPro() {
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');

  return (
    <div className="flex flex-col items-center bg-white font-sans">
      <main className="w-full max-w-3xl mx-auto min-h-screen max-h-24 px-10 py-16 flex flex-col gap-6">

        <div>
          <h1 className="text-4xl font-medium text-black">Honest pros near you</h1>
          <p className="text-md text-gray-500 mt-1">
            Outcome-verified.
          </p>
        </div>

        <AddressSearchBar onResult={r => setSearchStatus(r.status)} />

        {/* Results */}
        {searchStatus === 'loading' && (
          <p className="text-sm text-gray-400">Finding pros near you...</p>
        )}

        {searchStatus === 'available' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
              {mockPros.length} verified pros found.
            </p>
            {mockPros.map(pro => (
              <ProCard key={pro.id} pro={pro} />
            ))}
          </div>
        )}

        {searchStatus === 'idle' && (
          <p className="text-sm text-gray-400">Enter your address to find pros near you.</p>
        )}

      </main>
    </div>
  );
}