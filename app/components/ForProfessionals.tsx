import Link from 'next/link';

const points = [
  { title: 'No shared leads', description: 'One homeowner, one pro. Period.' },
  { title: 'No lead fees, ever', description: 'You only pay when you book a job — never per click or impression.' },
  { title: 'Built-in operating system', description: 'Quoting, scheduling, payments, messaging, customer history — all in one place.' },
  { title: '10% commission cap', description: 'We never take more than that. Most platforms take 25-40%.' },
];

const jobs = [
  { time: '9:30 AM', name: 'Diana Martinez', service: 'AC Capacitor Repair', next: true },
  { time: '11:00 AM', name: 'Brad Klein', service: 'Plumbing Diagnostic', next: false },
  { time: '2:00 PM', name: 'Maria Sandoval', service: 'Furnace Inspection', next: false },
];

function CheckSquare() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#d01111]">
      <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="m2.5 6.5 2.5 2.5 4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ProDashboardMock() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-black px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white">KRA⚡TEC</span>
          <span className="rounded-full bg-[#d01111] px-2 py-0.5 text-[10px] font-bold text-white">PRO</span>
        </div>
        <span className="flex size-7 items-center justify-center rounded-full bg-[#d01111] text-[10px] font-semibold text-white">MR</span>
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        <p className="text-lg font-bold text-black">Good morning, Marco</p>
        <p className="text-xs text-zinc-500">Tuesday, March 12 · 3 jobs today</p>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Today', value: '$1,840' },
            { label: 'This week', value: '12' },
            { label: 'Avg rating', value: '4.9' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{stat.label}</p>
              <p className="text-lg font-bold text-black">{stat.value}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Today&apos;s Jobs</p>
        <div className="mt-2 flex flex-col gap-2">
          {jobs.map((job) => (
            <div
              key={job.name}
              className={`rounded-xl border p-3 ${
                job.next ? 'border-[#d01111]/30 bg-[#d01111]/5' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${job.next ? 'text-[#d01111]' : 'text-black'}`}>{job.time}</span>
                {job.next && (
                  <span className="rounded-full bg-[#d01111] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Next</span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold text-black">{job.name}</p>
              <p className="text-xs text-zinc-500">{job.service}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ForProfessionals() {
  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-5xl mx-auto px-6 grid items-center gap-12 lg:grid-cols-2">
        {/* Left */}
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111] mb-4">
            <span className="size-2 rounded-full bg-[#d01111]" />
            For Professionals
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-black leading-tight">
            Built for pros. <span className="italic text-[#d01111]">Not against them</span>.
          </h2>
          <p className="mt-5 text-base text-zinc-500 max-w-md">
            We don&apos;t sell shared leads. We don&apos;t charge per click. We connect homeowners directly
            to one pro — and we only win when you win.
          </p>

          <ul className="mt-8 flex flex-col gap-5">
            {points.map((point) => (
              <li key={point.title} className="flex gap-3">
                <CheckSquare />
                <div>
                  <p className="text-sm font-semibold text-black">{point.title}</p>
                  <p className="text-sm text-zinc-500">{point.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/find-pro"
              className="rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95"
            >
              Apply to join →
            </Link>
            <Link
              href="/find-pro"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-50 active:scale-95"
            >
              See pro pricing
            </Link>
          </div>
        </div>

        {/* Right: dashboard mock */}
        <div className="flex justify-center lg:justify-end">
          <ProDashboardMock />
        </div>
      </div>
    </section>
  );
}
