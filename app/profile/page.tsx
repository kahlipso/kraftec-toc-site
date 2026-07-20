import { redirect } from 'next/navigation';
import { getAuthenticatedCustomer } from '@/app/lib/auth';
import { getBookingsForPhone } from '@/app/lib/bookings';
import type { CustomerBooking } from '@/app/types/booking';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function BookingCard({ booking, past }: { booking: CustomerBooking; past: boolean }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">{booking.proInitials}</span>
          <div>
            <h2 className="text-base font-semibold text-black">{booking.proName}</h2>
            <p className="mt-0.5 text-sm text-zinc-500">Inspection request</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${past ? 'bg-zinc-100 text-zinc-600' : 'bg-green-50 text-green-700'}`}>
          {past ? 'Past request' : 'Upcoming'}
        </span>
      </div>
      <div className="mt-5 border-t border-gray-100 pt-4 text-sm text-zinc-600">
        <p><span className="font-medium text-black">When:</span> {formatDate(booking.slotStart)}</p>
        <p className="mt-2"><span className="font-medium text-black">Where:</span> {booking.address}</p>
        {booking.description && <p className="mt-2"><span className="font-medium text-black">About:</span> {booking.description}</p>}
      </div>
    </article>
  );
}

function EmptyState({ past }: { past: boolean }) {
  return <div className="rounded-2xl border border-dashed border-gray-300 bg-[#fafafa] px-6 py-10 text-center text-sm text-zinc-500">{past ? 'Your completed or past requests will appear here.' : 'You do not have any upcoming requests.'}</div>;
}

export default async function ProfilePage() {
  const customer = await getAuthenticatedCustomer();
  if (!customer) redirect('/');

  const bookings = await getBookingsForPhone(customer.phone);
  const upcoming = bookings.filter((booking) => !booking.isPast).sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
  const past = bookings.filter((booking) => booking.isPast).sort((a, b) => new Date(b.slotStart).getTime() - new Date(a.slotStart).getTime());

  return (
    <main className="min-h-full bg-white pb-20">
      <div className="mx-auto max-w-4xl px-6 pt-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#d01111]">Your Kraftec account</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-black">Hi, {customer.name.split(' ')[0]}.</h1>
        <p className="mt-3 text-base text-zinc-500">Keep track of every home-service request in one place.</p>

        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-4"><h2 className="text-2xl font-bold tracking-tight text-black">Upcoming requests</h2><span className="text-sm text-zinc-500">{upcoming.length}</span></div>
          <div className="mt-5 grid gap-4">{upcoming.length ? upcoming.map((booking) => <BookingCard key={booking.id} booking={booking} past={false} />) : <EmptyState past={false} />}</div>
        </section>

        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-4"><h2 className="text-2xl font-bold tracking-tight text-black">Past requests</h2><span className="text-sm text-zinc-500">{past.length}</span></div>
          <div className="mt-5 grid gap-4">{past.length ? past.map((booking) => <BookingCard key={booking.id} booking={booking} past />) : <EmptyState past />}</div>
        </section>
      </div>
    </main>
  );
}
