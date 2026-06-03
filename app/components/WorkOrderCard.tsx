import Link from 'next/link';
import Image from 'next/image';
import type { WorkOrder } from '@/app/types/work-order';

function formatPrice(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export default function WordOrderCard({ order }: { order: WorkOrder }) {
  const hasPhoto = order.photos.length > 0;

  return (
    <Link href={`/work/${order.id}`}>
      <div className="flex flex-col w-90 max-h-65 shrink-0 rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">

        {/* Photo area */}
        <div className="relative w-full h-44 bg-gray-100">
          {hasPhoto ? (
            <Image
              src={order.photos[0]}
              alt={order.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-xs text-gray-400">No photo yet</span>
            </div>
          )}

          {/* Verified badge */}
          {order.verifiedAtMonths && (
            <span className="absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-md bg-green-100 text-green-700">
              {order.verifiedAtMonths} MO VERIFIED
            </span>
          )}

          {/* Photo count */}
          {order.photos.length > 1 && (
            <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-md bg-black/50 text-white">
              {order.photos.length} photos
            </span>
          )}
        </div>

        {/* Info area */}
        <div className="flex flex-col gap-1.5 p-4">
          <p className="text-xs text-gray-400">
            {order.location.city}, {order.location.state} · {order.completedDate}
          </p>
          <p className="text-sm font-medium text-black line-clamp-2">{order.title}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{order.description}</p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-medium text-black">
              {formatPrice(order.totalPaid)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              {order.isFairPrice && (
                <span className="text-green-500">✓</span>
              )}
              <span className="line-clamp-1 max-w-[120px]">{order.proName}</span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}