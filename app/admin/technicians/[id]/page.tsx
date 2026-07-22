import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updatePro } from '@/app/admin/actions';
import { getPro } from '@/app/lib/pros';
import LocationField from '../LocationField';

const field = 'mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm';
const label = 'block text-sm font-medium';
const section = 'rounded-2xl border border-gray-200 bg-white p-6';

export default async function TechnicianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pro = await getPro(id);
  if (!pro) notFound();

  return (
    <>
      <Link href="/admin/technicians" className="text-sm font-semibold text-[#d01111] hover:underline">
        ← All technicians
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-[#d01111]">Technician profile</p>
      <h2 className="mt-2 text-4xl font-bold tracking-tight">{pro.name}</h2>

      <form action={updatePro} className="mt-8 flex max-w-2xl flex-col gap-6">
        <input type="hidden" name="id" value={pro.id} />

        <section className={section}>
          <h3 className="text-lg font-bold">Basics</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className={label}>Company name<input required name="name" defaultValue={pro.name} className={field} /></label>
            <label className={label}>Initials<input required name="initials" maxLength={3} defaultValue={pro.initials} className={field} /></label>
            <label className={label}>Business type <span className="font-normal text-zinc-400">e.g. Family-owned</span><input name="type" defaultValue={pro.type} className={field} /></label>
            <label className={label}>Primary contact<input required name="contactName" defaultValue={pro.contactName} className={field} /></label>
            <label className={label}>Years operating<input name="yearsOperating" inputMode="numeric" defaultValue={pro.yearsOperating} className={field} /></label>
            <label className={label}>Homeowner rating <span className="font-normal text-zinc-400">out of 5</span><input name="rating" inputMode="decimal" defaultValue={pro.rating} className={field} /></label>
          </div>
        </section>

        <section className={section}>
          <h3 className="text-lg font-bold">Location &amp; coverage</h3>
          <p className="mt-1 text-sm text-zinc-500">Drives the map coverage circle and whether an address falls in range for booking.</p>
          <div className="mt-5">
            <LocationField defaultLat={pro.lat} defaultLng={pro.lng} defaultLocation={pro.location} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={label}>Service radius <span className="font-normal text-zinc-400">miles</span><input required name="serviceRadiusMiles" inputMode="decimal" defaultValue={pro.serviceRadiusMiles} className={field} /></label>
            <label className={label}>Status
              <select name="status" defaultValue={pro.status} className={field}>
                <option value="idle">Idle</option>
                <option value="working">Working</option>
                <option value="finishing">Finishing</option>
              </select>
            </label>
          </div>
        </section>

        <section className={section}>
          <h3 className="text-lg font-bold">Trades &amp; tags</h3>
          <label className="mt-5 block text-sm font-medium">Trades <span className="font-normal text-zinc-400">comma separated</span><input required name="trades" defaultValue={pro.trades.join(', ')} className={field} /></label>
          <label className="mt-4 block text-sm font-medium">Tags <span className="font-normal text-zinc-400">comma separated</span><input name="tags" defaultValue={pro.tags.join(', ')} className={field} /></label>
        </section>

        <section className={section}>
          <h3 className="text-lg font-bold">Reputation</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className={label}>Outcome score <span className="font-normal text-zinc-400">%</span><input name="outcomeScore" inputMode="numeric" defaultValue={pro.outcomeScore} className={field} /></label>
            <label className={label}>Verified jobs<input name="verifiedJobs" inputMode="numeric" defaultValue={pro.verifiedJobs} className={field} /></label>
          </div>
          <label className="mt-4 block text-sm font-medium">Profile note<textarea name="note" rows={4} defaultValue={pro.note} className={field} /></label>
        </section>

        <section className={section}>
          <h3 className="text-lg font-bold">Advanced</h3>
          <p className="mt-1 text-sm text-zinc-500">Raw JSON, shown as-is on the public profile page.</p>
          <label className="mt-5 block text-sm font-medium">Verification badges<textarea name="verification" rows={6} defaultValue={JSON.stringify(pro.verification, null, 2)} className={`${field} font-mono text-xs`} /></label>
          <label className="mt-4 block text-sm font-medium">Performance stats<textarea name="performance" rows={6} defaultValue={JSON.stringify(pro.performance, null, 2)} className={`${field} font-mono text-xs`} /></label>
          <label className="mt-4 block text-sm font-medium">Review scores<textarea name="reviews" rows={4} defaultValue={JSON.stringify(pro.reviews, null, 2)} className={`${field} font-mono text-xs`} /></label>
        </section>

        <button className="rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white">Save technician</button>
      </form>
    </>
  );
}
