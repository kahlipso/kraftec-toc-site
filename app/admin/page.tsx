import Link from 'next/link';
import { getAdminOverview } from '@/app/lib/admin';

function date(value: string) { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)); }

export default async function AdminPage() {
  const { counts, recent } = await getAdminOverview();
  const cards = [['New requests', counts.new, 'border-[#d01111]'], ['Today', counts.today, 'border-amber-400'], ['In progress', counts.inProgress, 'border-blue-400'], ['Unpublished work orders', counts.drafts, 'border-zinc-400']];
  return <>
    <p className="text-xs font-semibold uppercase tracking-widest text-[#d01111]">Operations</p><h2 className="mt-2 text-4xl font-bold tracking-tight">Overview</h2><p className="mt-2 text-zinc-500">The requests and records that need your attention.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, count, color]) => <div key={label as string} className={`rounded-2xl border-l-4 ${color} bg-white p-5 shadow-sm`}><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-4xl font-bold">{count}</p></div>)}</div>
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white"><div className="flex items-center justify-between p-6"><div><h3 className="text-xl font-bold">Next requests</h3><p className="mt-1 text-sm text-zinc-500">Upcoming customer appointments.</p></div><Link href="/admin/requests" className="text-sm font-semibold text-[#d01111] hover:underline">See all requests</Link></div><div className="border-t border-gray-100">{recent.length ? recent.map((request) => <Link href={`/admin/requests/${request.id}`} key={request.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4 last:border-0 hover:bg-[#fafafa]"><div><p className="font-semibold">{request.customerName} <span className="font-normal text-zinc-500">with {request.proName}</span></p><p className="mt-1 text-sm text-zinc-500">{request.address}</p></div><div className="text-right"><p className="text-sm font-medium">{date(request.slotStart)}</p><p className="mt-1 text-xs uppercase tracking-wide text-[#d01111]">{request.status.replace('_', ' ')}</p></div></Link>) : <p className="px-6 py-10 text-center text-sm text-zinc-500">No active requests.</p>}</div></section>
  </>;
}
