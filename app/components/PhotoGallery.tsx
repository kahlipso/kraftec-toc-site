'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

// Work-order photo gallery: a 3-tile preview that opens a full-screen lightbox
// of all the photos. The counts come straight from `photos.length`, so they're
// always accurate. Empty `photos` falls back to plain gradient tiles.
export default function PhotoGallery({ photos }: { photos: string[] }) {
  const total = photos.length;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const go = useCallback(
    (dir: number) => setOpenIndex((i) => (i === null ? i : (i + dir + total) % total)),
    [total],
  );

  // While the lightbox is open: arrow keys navigate, Esc closes, page scroll locks.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, close, go]);

  // No photos yet → the original gradient placeholders.
  if (total === 0) {
    return (
      <div className="grid h-[392px] grid-cols-1 gap-3 sm:grid-cols-[1.7fr_1fr] sm:grid-rows-2">
        <div className="row-span-1 rounded-2xl bg-gradient-to-br from-slate-300 to-stone-400 sm:row-span-2" />
        <div className="rounded-2xl bg-gradient-to-br from-sky-200 to-slate-300" />
        <div className="rounded-2xl bg-gradient-to-br from-stone-300 to-stone-400" />
      </div>
    );
  }

  return (
    <>
      {/* Preview tiles */}
      <div className="grid h-[392px] grid-cols-1 gap-3 sm:grid-cols-[1.7fr_1fr] sm:grid-rows-2">
        {/* Before — big left tile */}
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative row-span-1 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-300 to-stone-400 sm:row-span-2"
        >
          <Image src={photos[0]} alt="Before" fill sizes="(min-width:1024px) 640px, 100vw" className="object-cover" />
          <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
          <span className="absolute left-4 top-4 z-10 rounded-md bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Before
          </span>
        </button>

        {/* After — top-right tile */}
        <button
          type="button"
          onClick={() => setOpenIndex(total > 1 ? 1 : 0)}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-200 to-slate-300"
        >
          {photos[1] && (
            <Image src={photos[1]} alt="After" fill sizes="(min-width:1024px) 320px, 100vw" className="object-cover" />
          )}
          <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
          <span className="absolute left-4 top-4 z-10 rounded-md bg-[#d01111] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            After
          </span>
        </button>

        {/* View all — bottom-right tile */}
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-300 to-stone-400"
        >
          {photos[2] && (
            <Image src={photos[2]} alt="" fill sizes="(min-width:1024px) 320px, 100vw" className="object-cover" />
          )}
          <span className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/50" />
          <span className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-md transition group-hover:scale-105">
              📷 View all {total} photos
            </span>
          </span>
        </button>
      </div>

      {/* Lightbox */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          {/* Top bar: counter + close */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4 text-white">
            <span className="text-sm text-white/70">{openIndex + 1} / {total}</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="rounded-full px-2 text-2xl leading-none hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          {/* Prev */}
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              aria-label="Previous photo"
              className="absolute left-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
            >
              ‹
            </button>
          )}

          {/* Current image */}
          <div className="relative h-[76vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={photos[openIndex]} alt={`Photo ${openIndex + 1}`} fill sizes="100vw" className="object-contain" />
          </div>

          {/* Next */}
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(1); }}
              aria-label="Next photo"
              className="absolute right-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
            >
              ›
            </button>
          )}

          {/* Thumbnail strip */}
          {total > 1 && (
            <div
              className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-6 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  aria-label={`View photo ${i + 1}`}
                  className={`relative h-12 w-16 shrink-0 overflow-hidden rounded ${
                    i === openIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
