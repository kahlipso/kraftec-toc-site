import Link from 'next/link';
import { createPro } from '@/app/admin/actions';
import LocationField from '../LocationField';

const field = 'mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm';
const label = 'block text-sm font-medium';
const section = 'rounded-2xl border border-gray-200 bg-white p-6';

export default function NewTechnicianPage() {
  return (
    <>
      <Link href="/admin/technicians" className="text-sm font-semibold text-[#d01111] hover:underline">
        ← All technicians
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-[#d01111]">Supply network</p>
      <h2 className="mt-2 text-4xl font-bold tracking-tight">New technician</h2>
      <p className="mt-2 text-zinc-500">Onboard a pro directly — outcome score, verification, and reviews can be filled in after.</p>

      <form action={createPro} className="mt-8 flex max-w-2xl flex-col gap-6">
        <section className={section}>
          <h3 className="text-lg font-bold">Basics</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className={label}>Company name<input required name="name" className={field} /></label>
            <label className={label}>Initials<input required name="initials" maxLength={3} className={field} /></label>
            <label className={label}>Business type <span className="font-normal text-zinc-400">e.g. Family-owned</span><input name="type" className={field} /></label>
            <label className={label}>Primary contact<input required name="contactName" className={field} /></label>
            <label className={label}>Years operating<input name="yearsOperating" inputMode="numeric" defaultValue={0} className={field} /></label>
            <label className={label}>Homeowner rating <span className="font-normal text-zinc-400">out of 5</span><input name="rating" inputMode="decimal" defaultValue={0} className={field} /></label>
          </div>
        </section>

        <section className={section}>
          <h3 className="text-lg font-bold">Location &amp; coverage</h3>
          <p className="mt-1 text-sm text-zinc-500">Drives the map coverage circle and whether an address falls in range for booking.</p>
          <div className="mt-5">
            <LocationField />
          </div>
          <label className="mt-4 block text-sm font-medium">Service radius <span className="font-normal text-zinc-400">miles</span><input required name="serviceRadiusMiles" inputMode="decimal" defaultValue={15} className={field} /></label>
        </section>

        <section className={section}>
          <h3 className="text-lg font-bold">Trades &amp; tags</h3>
          <label className="mt-5 block text-sm font-medium">Trades <span className="font-normal text-zinc-400">comma separated</span><input required name="trades" placeholder="hvac, electrical" className={field} /></label>
          <label className="mt-4 block text-sm font-medium">Tags <span className="font-normal text-zinc-400">comma separated</span><input name="tags" className={field} /></label>
        </section>

        <section className={section}>
          <h3 className="text-lg font-bold">Reputation</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className={label}>Outcome score <span className="font-normal text-zinc-400">%</span><input name="outcomeScore" inputMode="numeric" defaultValue={0} className={field} /></label>
          </div>
          <label className="mt-4 block text-sm font-medium">Profile note<textarea name="note" rows={4} className={field} /></label>
        </section>

        <button className="rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white">Create technician</button>
      </form>
    </>
  );
}
