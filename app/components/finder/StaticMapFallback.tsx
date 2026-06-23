// Rendered when no Google Maps API key is configured, so the page still works
// in dev/CI without a key. This is the original hand-built SVG map mock.

function Pin({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <span
      className={`absolute z-10 rounded-full bg-[#d01111]/80 ring-4 ring-[#d01111]/15 ${className ?? ''}`}
      style={{ width: size, height: size }}
    />
  );
}

function EtaBubble({ label, className }: { label: string; className?: string }) {
  return (
    <span className={`absolute z-20 rounded-full bg-black px-2 py-0.5 text-[11px] font-medium text-white whitespace-nowrap ${className ?? ''}`}>
      {label}
    </span>
  );
}

export default function StaticMapFallback() {
  return (
    <div className="absolute inset-0">
      <svg className="absolute inset-0 size-full" preserveAspectRatio="none">
        {[80, 175, 280, 370].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="100%" y2={y} stroke="#e2e2de" strokeWidth="2" />
        ))}
        {[110, 240, 360, 470].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100%" stroke="#e2e2de" strokeWidth="2" />
        ))}
        <line x1="58%" y1="0" x2="100%" y2="38%" stroke="#f0d9a0" strokeWidth="12" />
        <path d="M0 70 Q 200 40 420 80 T 600 70" fill="none" stroke="#bcd4e6" strokeWidth="4" />
        <circle cx="290" cy="230" r="150" fill="rgba(208,17,17,0.04)" stroke="rgba(208,17,17,0.25)" strokeWidth="1.5" strokeDasharray="4 6" />
      </svg>

      <span className="absolute left-[28%] top-[78px] text-[9px] uppercase tracking-wide text-gray-400">Irvine Blvd</span>
      <span className="absolute left-[36%] top-[180px] text-[9px] uppercase tracking-wide text-gray-400">Barranca Pkwy</span>
      <span className="absolute left-[18%] top-[300px] text-[9px] uppercase tracking-wide text-gray-400">Woodbridge</span>
      <span className="absolute right-[14%] top-[120px] text-[9px] uppercase tracking-wide text-gray-400">Northwood</span>

      <Pin className="left-[26%] top-[90px]" />
      <Pin className="left-[16%] top-[160px]" size={20} />
      <Pin className="left-[22%] top-[250px]" />
      <Pin className="left-[52%] top-[150px]" />
      <Pin className="left-[57%] top-[260px]" size={18} />
      <Pin className="left-[16%] top-[300px]" />
      <Pin className="left-[33%] top-[315px]" size={18} />

      <EtaBubble label="12 min" className="left-[21%] top-[160px]" />
      <EtaBubble label="18 min" className="left-[49%] top-[245px]" />
      <EtaBubble label="9 min" className="left-[24%] top-[300px]" />

      <span className="absolute left-[36%] top-[225px] z-20 flex size-7 items-center justify-center rounded-full bg-black">
        <span className="size-2.5 rounded-full bg-white" />
      </span>
      <span className="absolute left-[34%] top-[258px] z-20 rounded-full bg-black px-2.5 py-0.5 text-[11px] font-semibold text-white">
        YOU
      </span>
    </div>
  );
}
