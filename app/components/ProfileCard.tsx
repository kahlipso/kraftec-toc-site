import Link from 'next/link';
import type { Pro } from '@/app/types/pro';

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function ProfileCard({ pro }: { pro: Pro }) {
  const checks = [
    { label: 'License current',     value: pro.checks.licenseCurrent },
    { label: 'Insurance verified',  value: pro.checks.insuranceVerified },
    { label: 'Background checked',  value: pro.checks.backgroundChecked },
    { label: 'EPA 608 cert',        value: pro.checks.epa608Cert },
  ];

  const vsFairLabel = pro.vsFair >= 0 ? `+${pro.vsFair}%` : `${pro.vsFair}%`;

  return (
    <Link href={`/pro/${pro.id}`}>
      <div className="flex items-center gap-6 p-5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">

        {/* Avatar */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-800 text-white font-medium text-sm shrink-0">
          {getInitials(pro.name)}
        </div>

        {/* Name + description + tags */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <p className="font-medium text-black text-sm">{pro.name}</p>
          <p className="text-xs text-gray-500">
            {pro.type} · {pro.yearsInBusiness} yrs · {pro.distanceMiles} mi away
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {pro.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Verification checks */}
        <div className="flex flex-col gap-1 shrink-0">
          {checks.filter(c => c.value).map(check => (
            <div key={check.label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="text-green-500">✓</span>
              {check.label}
            </div>
          ))}
        </div>

        {/* Outcome score */}
        <div className="flex flex-col items-end shrink-0 min-w-[80px]">
          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-medium text-black">{pro.outcomeScore}</span>
            <span className="text-sm text-black">%</span>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Outcome Score</p>
          <p className="text-xs text-gray-500">{vsFairLabel} vs fair</p>
        </div>

      </div>
    </Link>
  );
}