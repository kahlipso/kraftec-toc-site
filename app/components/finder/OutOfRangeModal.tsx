'use client';

import { useEffect } from 'react';

// Shown when a homeowner tries to view/book a pro whose coverage radius
// doesn't reach their searched address. Shell copied from MatchOverlay's
// modal pattern (backdrop + Esc close, body-scroll lock).
export default function OutOfRangeModal({
  proName,
  searchedLabel,
  onClose,
}: {
  proName: string;
  searchedLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full px-2 text-xl leading-none text-zinc-400 hover:bg-gray-100 hover:text-black"
        >
          ✕
        </button>

        <p className="text-xs font-semibold uppercase tracking-widest text-[#d01111]">Not available here</p>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-black">
          {proName} doesn&apos;t cover {searchedLabel} yet
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          This pro&apos;s service area doesn&apos;t reach your address, so booking isn&apos;t available. Try a
          different pro, or check back as our network grows.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-50"
        >
          Back to search
        </button>
      </div>
    </div>
  );
}
