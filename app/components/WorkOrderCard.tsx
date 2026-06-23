import Link from 'next/link';
import Image from 'next/image';
import type { WorkOrder } from '@/app/types/work-order';

function formatPrice(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export default function WorkOrderCard({ order }: { order: WorkOrder }) {
  const hasPhoto = order.photos.length > 0;

  return (
    <Link
      href={`/work/${order.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-sm"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Photo area */}
        <div className="relative h-44 w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-300 to-stone-400 sm:h-auto sm:w-72">
          {hasPhoto && (
            <Image src={order.photos[0]} alt={order.title} fill className="object-cover" />
          )}

          {/* Verified badge */}
          {order.verifiedAtMonths > 0 && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-700">
              <svg className="size-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m2.5 6.5 2.5 2.5 4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {order.verifiedAtMonths}-mo verified
            </span>
          )}

          {/* Photo count */}
          {order.photoCount > 0 && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
              <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="12" height="9" rx="1.5" />
                <circle cx="8" cy="8.5" r="2" />
              </svg>
              {order.photoCount} photos
            </span>
          )}
        </div>

        {/* Info area */}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              <span className="text-[#d01111]">📍</span>
              {order.location.city}, {order.location.state}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              {order.completedDate}
            </p>
          </div>

          <h3 className="mt-2 text-lg font-semibold text-black">{order.title}</h3>
          <p className="mt-1 text-sm text-zinc-500">{order.description}</p>

          <hr className="my-4 border-gray-100" />

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold tracking-tight text-black">
              {formatPrice(order.totalPaid)}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                {order.proInitials}
              </span>
              <span className="text-sm text-zinc-600">{order.proName}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
