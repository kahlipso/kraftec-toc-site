import Link from 'next/link';
import { archiveWorkOrder } from '@/app/admin/actions';
import { getAdminWorkOrders } from '@/app/lib/admin';

export default async function WorkOrdersPage() {
  const orders = await getAdminWorkOrders();
  return <>
    <p className="text-xs font-semibold uppercase tracking-widest text-[#d01111]">Public proof</p>
    <h2 className="mt-2 text-4xl font-bold tracking-tight">Work orders</h2>
    <p className="mt-2 text-zinc-500">Completed jobs, final prices, and public visibility.</p>
    <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-5 py-4">Work order</th><th className="px-5 py-4">Technician</th><th className="px-5 py-4">Paid</th><th className="px-5 py-4">Visibility</th><th className="px-5 py-4" /></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-t border-gray-100"><td className="px-5 py-4"><p className="font-semibold">{order.title}</p><p className="text-xs text-zinc-500">{order.id} · {order.completedDate}</p></td><td className="px-5 py-4">{order.proName}</td><td className="px-5 py-4">${order.totalPaid.toLocaleString()}</td><td className="px-5 py-4"><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium">{order.published ? 'Published' : 'Draft'}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-3"><Link href={`/admin/work-orders/${order.id}`} className="font-semibold text-[#d01111] hover:underline">Manage</Link><form action={archiveWorkOrder}><input type="hidden" name="id" value={order.id} /><button className="font-semibold text-red-700 hover:underline">Archive</button></form></div></td></tr>)}</tbody></table>{!orders.length && <p className="p-10 text-center text-sm text-zinc-500">Create a work order from a completed request.</p>}</div>
  </>;
}
