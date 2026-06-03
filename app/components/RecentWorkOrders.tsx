'use client';

import { useRef } from 'react';
import Link from 'next/link';
import WorkOrderCard from './WorkOrderCard';
import type { WorkOrder } from '@/app/types/work-order';

// TODO: replace with DB query — fetch 10 most recent verified work orders
const mockOrders: WorkOrder[] = [
  {
    id: 'KR-2049',
    title: 'Full AC system replacement — 3-ton Carrier heat pump',
    description: 'Previous contractor had topped off refrigerant 3 times in 2 years without diagnosing the leak.',
    location: { city: 'Phoenix', state: 'AZ', zip: '85032' },
    completedDate: 'Mar 12, 2025',
    totalPaid: 8940,
    proName: 'Martinez & Reyes HVAC',
    proId: 'martinez-reyes',
    photos: [],
    verifiedAtMonths: 12,
    isFairPrice: true,
  },
  {
    id: 'KR-1847',
    title: 'Capacitor replacement',
    description: 'Competing quote was $890 for a $15 part and 20 min labor.',
    location: { city: 'Mesa', state: 'AZ', zip: '85201' },
    completedDate: 'Feb 8, 2025',
    totalPaid: 284,
    proName: 'Desert Cool Services',
    proId: 'desert-cool',
    photos: [],
    verifiedAtMonths: 12,
    isFairPrice: true,
  },
  {
    id: 'KR-1923',
    title: 'Air handler + ductwork',
    description: 'Replaced leaky air handler in attic, rerouted two supply runs.',
    location: { city: 'Scottsdale', state: 'AZ', zip: '85251' },
    completedDate: 'Feb 21, 2025',
    totalPaid: 4210,
    proName: 'Valley Air & Heat',
    proId: 'valley-air',
    photos: [],
    verifiedAtMonths: 12,
    isFairPrice: true,
  },
  {
    id: 'KR-1924',
    title: 'Air handler + ductwork',
    description: 'Replaced leaky air handler in attic, rerouted two supply runs.',
    location: { city: 'Scottsdale', state: 'AZ', zip: '85251' },
    completedDate: 'Feb 21, 2025',
    totalPaid: 4210,
    proName: 'Valley Air & Heat',
    proId: 'valley-air',
    photos: [],
    verifiedAtMonths: 12,
    isFairPrice: true,
  },
  {
    id: 'KR-1925',
    title: 'Air handler + ductwork',
    description: 'Replaced leaky air handler in attic, rerouted two supply runs.',
    location: { city: 'Scottsdale', state: 'AZ', zip: '85251' },
    completedDate: 'Feb 21, 2025',
    totalPaid: 4210,
    proName: 'Valley Air & Heat',
    proId: 'valley-air',
    photos: [],
    verifiedAtMonths: 12,
    isFairPrice: true,
  },
  {
    id: 'KR-1926',
    title: 'Air handler + ductwork',
    description: 'Replaced leaky air handler in attic, rerouted two supply runs.',
    location: { city: 'Scottsdale', state: 'AZ', zip: '85251' },
    completedDate: 'Feb 21, 2025',
    totalPaid: 4210,
    proName: 'Valley Air & Heat',
    proId: 'valley-air',
    photos: [],
    verifiedAtMonths: 12,
    isFairPrice: true,
  },

];

export default function RecentWorkOrders() {

  return (
    <section className="w-full px-24 py-16">
      <div className="max-w-4xl mx-auto px-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-md font-medium text-[#D01111] uppercase tracking-widest mb-2">
              Recent Work
            </p>
            <h2 className="text-5xl font-medium text-black leading-tight">
              Real jobs. Real prices.<br />
              Verified by the <i><b>homeowner</b></i>.
            </h2>
            <p className="text-sm text-gray-500 mt-3">
              Every job below was completed by a Kraftec-verified pro.
              Tap any card to see the full story — what was wrong, what
              we did, what it cost, and what the homeowner said 12 months later.
            </p>
          </div>
          <Link
            href="/work"
            className="text-sm text-gray-500 hover:text-black transition-colors shrink-0 mt-1"
          >
            See all work →
          </Link>
        </div>
      </div>

      {/* Horizontal scroll row — overflows outside the max-w container */}
      <div className="mt-8 pl-10 py-10 mx-auto overflow-x-auto">
        <div className="flex gap-4 w-max pr-10">
          {mockOrders.map(order => (
            <WorkOrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </section>
  );
}