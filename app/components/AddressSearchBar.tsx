'use client';

import { useState } from 'react';

// US state abbreviations for basic validation
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
];

// States where Kraftec is live — update as you expand
const SUPPORTED_STATES = ['AZ', 'TX', 'FL'];

type Status = 'idle' | 'loading' | 'available' | 'unavailable' | 'invalid';

type SearchResult = {
  status: Status;
  state?: string;
};

function parseUSState(input: string): string | null {
  for (const s of US_STATES) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(input)) return s.toUpperCase();
  }
  return null;
}

interface Props {
  onResult: (result: SearchResult) => void;
}

export default function AddressSearchBar({ onResult }: Props) {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSearch() {
    if (!address.trim()) return;

    const state = parseUSState(address);

    if (!state) {
      setStatus('invalid');
      onResult({ status: 'invalid' });
      return;
    }

    setStatus('loading');
    onResult({ status: 'loading' });

    // -----------------------------------------------
    // TODO: replace mock with real API/DB call
    // e.g. const res = await fetch(`/api/pros?address=${encodeURIComponent(address)}`)
    // const data = await res.json()
    // -----------------------------------------------
    await new Promise(r => setTimeout(r, 600)); // mock delay

    const isSupported = SUPPORTED_STATES.includes(state);
    const result: SearchResult = {
      status: isSupported ? 'available' : 'unavailable',
      state,
    };

    setStatus(result.status);
    onResult(result);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-4 py-2.5 bg-white focus-within:border-gray-400 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-gray-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter your address, city, or zip code"
            className="flex-1 text-sm outline-none text-black placeholder:text-gray-400 bg-transparent"
          />
          {address && (
            <button onClick={() => setAddress('')} className="text-gray-400 hover:text-gray-600 text-xs">
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={status === 'loading'}
          className="bg-[#D01111]/35 hover:opacity-75 active:scale-95 disabled:opacity-50 rounded-lg px-5 py-2 text-sm text-black transition-all"
        >
          {status === 'loading' ? 'Searching...' : 'Enter'}
        </button>
      </div>

      {/* Feedback messages */}
      {status === 'invalid' && (
        <p className="text-xs text-red-500">
          Please enter a valid US address, city, or zip code.
        </p>
      )}
      {status === 'unavailable' && (
        <p className="text-xs text-gray-500">
          Kraftec isn't in your state yet — we're expanding soon.
          <button className="underline ml-1 hover:text-black transition-colors">
            Get notified when we launch near you.
          </button>
        </p>
      )}
    </div>
  );
}