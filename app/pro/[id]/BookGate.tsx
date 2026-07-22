'use client';

import { useState } from 'react';
import Link from 'next/link';
import OutOfRangeModal from '@/app/components/finder/OutOfRangeModal';

// The "Book a time slot" entry point. `inRange` is computed server-side (see
// page.tsx) from the searched address query params, if any were passed along
// from the finder/find-pro flow. No address context = nothing to gate on.
export default function BookGate({
  proId,
  proName,
  inRange,
  searchedLabel,
}: {
  proId: string;
  proName: string;
  inRange: boolean;
  searchedLabel?: string;
}) {
  const [showModal, setShowModal] = useState(false);

  if (inRange) {
    return (
      <Link
        href={`/pro/${proId}/book`}
        className="ml-4 shrink-0 rounded-full bg-[#d01111] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95"
      >
        Book a time slot →
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="ml-4 shrink-0 rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-500"
      >
        Not available at your address
      </button>
      {showModal && (
        <OutOfRangeModal
          proName={proName}
          searchedLabel={searchedLabel ?? 'your address'}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
