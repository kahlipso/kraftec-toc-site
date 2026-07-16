import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPro } from '@/app/lib/pros';
import { getWorkOrdersByPro } from '@/app/lib/work-orders';
import WorkOrderCard from '@/app/components/WorkOrderCard';

const tabs = [
  { label: 'Overview', href: '#top' },
  { label: 'Verification', href: '#verification' },
  { label: 'Performance', href: '#performance' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Work orders', href: '#work-orders' },
];

function CheckCircle() {
  return (
    <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-green-500">
      <svg className="size-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="m2.5 6.5 2.5 2.5 4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pro = await getPro(id);
  if (!pro) notFound();

  const workOrders = await getWorkOrdersByPro(pro.id);

  return (
    <div id="top" className="bg-white pb-20">
      {/* Sticky tab bar */}
      <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <ul className="flex gap-6 overflow-x-auto">
            {tabs.map((tab, i) => (
              <li key={tab.label}>
                <a
                  href={tab.href}
                  className={`block whitespace-nowrap border-b-2 py-4 text-sm transition-colors ${
                    i === 0
                      ? 'border-[#d01111] font-semibold text-[#d01111]'
                      : 'border-transparent text-zinc-500 hover:text-black'
                  }`}
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href={`/pro/${pro.id}/book`}
            className="ml-4 shrink-0 rounded-full bg-[#d01111] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95"
          >
            Book a time slot →
          </Link>
        </div>
      </nav>

      {/* Pro header */}
      <header className="mx-auto max-w-5xl px-6 pt-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-5">
            <span className="flex size-28 shrink-0 items-center justify-center rounded-full bg-black text-3xl font-semibold text-white">
              {pro.initials}
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black">{pro.name}</h1>
              <p className="mt-1 text-sm text-zinc-500">
                {pro.type} · {pro.location} · {pro.yearsOperating} years operating
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pro.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-zinc-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-5xl font-bold tracking-tight text-[#d01111]">
              {pro.outcomeScore}
              <span className="text-2xl">%</span>
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Outcome score</p>
          </div>
        </div>
      </header>

      {/* Verification */}
      <section id="verification" className="mx-auto max-w-5xl scroll-mt-20 px-6 pt-12">
        <hr className="border-gray-200" />
        <h2 className="mt-6 text-xl font-bold text-black">Verification</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pro.verification.map((v) => (
            <div key={v.title} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-black">{v.title}</p>
                <CheckCircle />
              </div>
              <p className="mt-2 text-sm text-zinc-500">{v.detail}</p>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-wide text-[#d01111]">{v.status}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Performance */}
      <section id="performance" className="mx-auto max-w-5xl scroll-mt-20 px-6 pt-12">
        <hr className="border-gray-200" />
        <h2 className="mt-6 text-xl font-bold text-black">Performance</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pro.performance.map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-[#fafafa] p-5">
              <p className="text-3xl font-bold tracking-tight text-[#d01111]">{s.value}</p>
              <p className="mt-2 text-sm font-medium text-black">{s.label}</p>
              <p className="text-xs text-zinc-500">{s.sublabel}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mx-auto max-w-5xl scroll-mt-20 px-6 pt-12">
        <hr className="border-gray-200" />
        <h2 className="mt-6 text-xl font-bold text-black">Reviews</h2>
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <ul className="flex flex-col gap-4">
            {pro.reviews.map((r) => (
              <li key={r.label} className="flex items-center gap-4">
                <span className="w-40 shrink-0 text-sm text-zinc-700 sm:w-48">{r.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <span className="block h-full rounded-full bg-[#d01111]" style={{ width: `${(r.score / 10) * 100}%` }} />
                </span>
                <span className="w-8 shrink-0 text-right text-sm font-semibold text-black">{r.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Work orders */}
      <section id="work-orders" className="mx-auto max-w-5xl scroll-mt-20 px-6 pt-12">
        <hr className="border-gray-200" />
        <h2 className="mt-6 text-xl font-bold text-black">Work orders</h2>
        <p className="mt-1 text-sm text-zinc-500">Jobs completed by this pro — verified by the homeowner.</p>
        {workOrders.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-zinc-500">
            No published work orders yet.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            {workOrders.map((order) => (
              <WorkOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
