import { notFound } from 'next/navigation';
import { getPro } from '@/app/lib/pros';
import { getAvailability } from '@/app/lib/bookings';
import BookingFlow from './BookingFlow';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pro = await getPro(id);
  if (!pro) notFound();

  // The week grid is computed fresh on every load: fixed times minus booked rows.
  const availability = await getAvailability(pro.id);

  return (
    <div className="bg-white pb-20">
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <BookingFlow
          proId={pro.id}
          proName={pro.name}
          proInitials={pro.initials}
          contactName={pro.contactName}
          availability={availability}
        />
      </div>
    </div>
  );
}
