import Link from 'next/link';
import { getRecentWorkOrders } from '@/app/lib/work-orders';
import WorkOrderCard from '@/app/components/WorkOrderCard';

// Render per-request: the list reads the live database (and must not run at
// build time, where no DATABASE_URL exists).
export const dynamic = 'force-dynamic';

export default async function Page() {
  const orders = await getRecentWorkOrders();

  return (
    <div className="bg-white pb-20">
      <div className="mx-auto max-w-5xl px-6 pt-10">
        {/* Breadcrumb */}
        <p className="text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-600">Home</Link> / Recent Work / All work orders
        </p>

        {/* Header */}
        <p className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111]">
          <span className="size-2 rounded-full bg-[#d01111]" />
          Work Order Archive
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-black sm:text-5xl">
          Every job. Out in the open.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-zinc-500">
          Every completed job on Kraftec, with the real price paid and the verified pro who did
          it — most recent first.
        </p>

        {/* Count */}
        <p className="mt-8 text-sm text-zinc-500">
          Showing <span className="font-semibold text-black">{orders.length}</span>{' '}
          {orders.length === 1 ? 'job' : 'jobs'}
        </p>

        {/* List — newest completion date first */}
        {orders.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-zinc-500">
            No published work orders yet — check back soon.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-5">
            {orders.map((order) => (
              <WorkOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
