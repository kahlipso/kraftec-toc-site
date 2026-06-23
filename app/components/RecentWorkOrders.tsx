import Link from 'next/link';
import WorkOrderCard from './WorkOrderCard';
import { getRecentWorkOrders } from '@/app/lib/work-orders';

export default function RecentWorkOrders() {
  const orders = getRecentWorkOrders();

  return (
    <section className="w-full bg-[#f7f7f7] py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111] mb-4">
              <span className="size-2 rounded-full bg-[#d01111]" />
              Recent Work
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-black leading-tight">
              Real jobs. Real prices.<br />
              Verified <span className="italic text-[#d01111]">by the homeowner</span>.
            </h2>
            <p className="mt-4 text-sm text-zinc-500">
              Every job below was completed by a Kraftec-verified pro. Tap any card to see the
              full story — what was wrong, what we did, what it cost, and what the homeowner
              said 12 months later.
            </p>
          </div>
          <Link
            href="/work"
            className="mt-1 shrink-0 text-sm font-medium text-zinc-600 transition-colors hover:text-black"
          >
            See all work →
          </Link>
        </div>

        {/* Vertical list */}
        <div className="mt-10 flex flex-col gap-5">
          {orders.map((order) => (
            <WorkOrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </section>
  );
}
