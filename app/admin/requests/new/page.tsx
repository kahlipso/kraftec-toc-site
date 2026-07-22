import Link from 'next/link';
import { createRequest } from '@/app/admin/actions';
import { bookingStatuses, getAdminPros } from '@/app/lib/admin';

const field = 'mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm';

export default async function NewRequestPage() {
  const pros = await getAdminPros();
  return (
    <>
      <Link href="/admin/requests" className="text-sm font-semibold text-[#d01111] hover:underline">
        ← All requests
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-[#d01111]">Customer operations</p>
      <h2 className="mt-2 text-4xl font-bold tracking-tight">New request</h2>
      <p className="mt-2 text-zinc-500">For logging a phone-in booking, or backdating an already-completed job.</p>

      <form action={createRequest} className="mt-8 max-w-xl rounded-2xl border border-gray-200 bg-white p-6">
        <label className="block text-sm font-medium">Technician
          <select required name="proId" className={field}>
            <option value="">Select a technician…</option>
            {pros.map((pro) => <option key={pro.id} value={pro.id}>{pro.name}</option>)}
          </select>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">Customer name<input required name="name" className={field} /></label>
          <label className="text-sm font-medium">Customer phone<input required name="phone" inputMode="tel" placeholder="(555) 555-1234" className={field} /></label>
        </div>

        <label className="mt-4 block text-sm font-medium">Appointment time
          <input required name="slotStart" type="datetime-local" className={field} />
        </label>

        <label className="mt-4 block text-sm font-medium">Service address<input required name="address" className={field} /></label>
        <label className="mt-4 block text-sm font-medium">Description<textarea name="description" rows={3} className={field} /></label>

        <label className="mt-4 block text-sm font-medium">Status
          <select name="status" defaultValue="new" className={field}>
            {bookingStatuses.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
          </select>
        </label>

        <button className="mt-6 rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white">Create request</button>
      </form>
    </>
  );
}
