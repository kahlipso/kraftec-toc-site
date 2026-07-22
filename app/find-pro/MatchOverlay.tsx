'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { findMatch } from './actions';
import type { ProMatch } from '@/app/lib/pros';
import type { Trade } from '@/app/lib/trades';

type Phase = 'searching' | 'found' | 'none';

const MIN_SEARCH_MS = 1800; // keep the animation visible even when the DB is fast

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function MatchOverlay({
  trade,
  location,
  onClose,
}: {
  trade: Trade;
  location: { lat: number; lng: number; label: string };
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('searching');
  const [match, setMatch] = useState<ProMatch | null>(null);

  // Mount = start the search. Run the action alongside a minimum-display timer.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [result] = await Promise.all([
        findMatch(trade.slug, location.lat, location.lng),
        delay(MIN_SEARCH_MS),
      ]);
      if (cancelled) return;
      setMatch(result);
      setPhase(result ? 'found' : 'none');
    })();
    return () => {
      cancelled = true;
    };
  }, [trade.slug, location.lat, location.lng]);

  // Esc closes; page scroll locks while open (PhotoGallery pattern).
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
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white p-8 shadow-2xl"
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

        {phase === 'searching' && (
          <div className="flex flex-col items-center text-center">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111]">
              <span className="size-2 rounded-full bg-[#d01111]" />
              Finding your pro
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-black">
              Matching you with the right pro.
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              We&apos;re finding the closest, best-value pro for your job — won&apos;t take a moment.
            </p>

            {/* Radar: beacon + three staggered pulse rings */}
            <div className="relative my-10 flex size-44 items-center justify-center">
              {[0, 0.6, 1.2].map((delaySec) => (
                <span
                  key={delaySec}
                  className="absolute inset-0 rounded-full border-2 border-[#d01111]/40"
                  style={{ animation: `pulseRing 1.8s ease-out ${delaySec}s infinite` }}
                />
              ))}
              <span className="flex size-16 items-center justify-center rounded-full bg-[#d01111] text-2xl text-white">
                ⌖
              </span>
            </div>

            <span className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-zinc-600 shadow-sm">
              Searching your area…
            </span>

            <div className="mt-6 grid w-full grid-cols-3 gap-3">
              {[
                { k: 'Trade', v: trade.name },
                { k: 'Radius', v: '~8 mi' },
                { k: 'ETA', v: '~10 sec' },
              ].map((stat) => (
                <div key={stat.k} className="rounded-xl bg-[#fafafa] p-3 text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{stat.k}</p>
                  <p className="mt-1 text-sm font-medium text-black">{stat.v}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">📍 {location.label}</p>
          </div>
        )}

        {phase === 'found' && match && (
          <div className="text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111]">
              <span className="size-2 rounded-full bg-[#d01111]" />
              Your pro is ready
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-black">Meet your pro.</h2>
            <p className="mt-1 text-sm text-zinc-500">
              We matched you with the closest, best-value {trade.name} pro in your area.
            </p>

            <div className="mt-6 rounded-2xl border border-gray-200 p-6 text-left">
              <div className="flex items-start gap-4">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-black text-xl font-semibold text-white">
                  {match.pro.initials}
                </span>
                <div>
                  <p className="text-lg font-bold text-black">{match.pro.contactName}</p>
                  <p className="text-sm text-zinc-500">
                    {match.pro.name} · {match.pro.yearsOperating} yrs · {match.distanceMiles.toFixed(1)} mi away
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#d01111]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#d01111]">{trade.name}</span>
                    {match.pro.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">{tag}</span>
                    ))}
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">{match.pro.outcomeScore}% outcome score</span>
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">License verified</span>
                  </div>
                </div>
              </div>

              <hr className="my-5 border-gray-100" />

              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                A note from {match.pro.contactName.split(' ')[0]}
              </p>
              <blockquote className="mt-2 border-l-2 border-[#d01111] pl-4 text-sm leading-relaxed text-zinc-600">
                &quot;{match.pro.note}&quot;
              </blockquote>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#fafafa] p-3">
                  <p className="text-lg font-bold text-black">{match.pro.performance[0]?.value ?? '—'}</p>
                  <p className="text-[11px] text-zinc-500">Callback-free at 12 mo</p>
                </div>
                <div className="rounded-xl bg-[#fafafa] p-3">
                  <p className="text-lg font-bold text-black">★ {match.pro.rating.toFixed(1)}</p>
                  <p className="text-[11px] text-zinc-500">Homeowner rating</p>
                </div>
                <div className="rounded-xl bg-[#fafafa] p-3">
                  <p className="text-lg font-bold text-black">{match.pro.verifiedJobs}</p>
                  <p className="text-[11px] text-zinc-500">Verified jobs</p>
                </div>
              </div>

              <Link
                href={`/pro/${match.pro.id}`}
                className="mt-5 block w-full rounded-full bg-[#d01111] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-[0.99]"
              >
                Continue to {match.pro.contactName.split(' ')[0]}&apos;s profile →
              </Link>
              <p className="mt-3 text-center text-xs text-zinc-400">
                Your contact info is not shared until you confirm your booking.
              </p>
            </div>
          </div>
        )}

        {phase === 'none' && (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#d01111]">No match yet</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-black">
              No {trade.name} pros cover your address yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              {`We couldn't find a ${trade.name} pro whose coverage reaches your address — we're expanding our network, so check back soon or try a different trade.`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-50"
            >
              Back to search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}