import Link from 'next/link';

type Feature = {
  icon: string;
  title: string;
  description: string;
  badge?: string;
};

const features: Feature[] = [
  { icon: '📍', title: 'Live GPS Tracking', description: 'Watch your pro drive to you in real time — like Uber, for home services.', badge: 'EXCLUSIVE' },
  { icon: '🤖', title: 'AI Instant Quote', description: 'Describe the job in plain English, get a price in seconds. No phone calls.', badge: 'NEW' },
  { icon: '🛡️', title: '90-Day Guarantee', description: 'We stand behind every job for 90 days. If it breaks, we fix it free.' },
  { icon: '🗂️', title: 'Home History Log', description: 'Every job saved forever. Great for resale value and tracking maintenance.' },
  { icon: '💬', title: 'In-App Messaging', description: 'Chat directly with your pro before, during, and after the job. No phone tag.' },
  { icon: '💳', title: 'Membership Plan', description: 'Monthly subscribers get priority booking and 10% off every service.', badge: 'POPULAR' },
  { icon: '🚨', title: 'Same-Day Emergency', description: 'Urgent job? Premium tier dispatches a certified pro within hours, guaranteed.' },
  { icon: '🖼️', title: 'Before/After Photos', description: 'Every job requires documented photos. Visual proof of quality, stored forever.' },
  { icon: '🎁', title: 'Referral Program', description: 'Invite friends, earn credit toward future bookings. Build the network together.' },
];

export default function PlatformFeatures() {
  return (
    <section className="w-full bg-[#f7f7f7] py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header (left-aligned) */}
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111] mb-4">
          <span className="size-2 rounded-full bg-[#d01111]" />
          Platform Features
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-black leading-tight">
          What We Offer.
        </h2>
        <p className="mt-3 text-base text-zinc-500 max-w-2xl">
          We&apos;re not just transparency. We&apos;re a full home-services platform built around how
          homeowners actually live — with tools Angi and Thumbtack haven&apos;t even started building.
        </p>

        {/* Feature grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="relative rounded-xl border border-gray-200 bg-white p-6">
              {feature.badge && (
                <span className="absolute right-5 top-5 rounded-full bg-[#d01111] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {feature.badge}
                </span>
              )}
              <span className="flex size-12 items-center justify-center rounded-xl bg-[#fafafa] text-2xl">
                {feature.icon}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-black">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* For Pros banner */}
        <div className="mt-10 flex flex-col gap-6 rounded-2xl bg-black px-8 py-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80">
              For Pros
            </span>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
              Built for franchisees too, with a dashboard of their own.
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Every franchisee gets their own operations portal — jobs, scheduling, payments, and
              team management in one place.
            </p>
          </div>
          <Link
            href="/find-pro"
            className="shrink-0 self-start rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95 md:self-auto"
          >
            See the pro dashboard →
          </Link>
        </div>
      </div>
    </section>
  );
}
