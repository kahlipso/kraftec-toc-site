import Image from "next/image";

const affiliates = [
  {name: "carrier", logo: "/aff-logos/carrier-logo.png"},
  {name: "sibi", logo: "/aff-logos/sibi-logo.png"},
  {name: "goodman", logo: "/aff-logos/goodman-logo.png"},
  {name: "ahri", logo: "/aff-logos/ahri-logo.png"},
  {name: "johnson", logo: "/aff-logos/johnson-logo.png"},
];

export default function AffiliatesCarousel() {
  const base = [...affiliates, ...affiliates, ...affiliates, ...affiliates, ...affiliates];
  const items = [...base, ...base];
  return(
    <div className="w-full mx-auto justify-center" style={{ animation: "floatUp 0.8s ease-out 0.8s both" }}>
      <div className="relative overflow-hidden py-8">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 sm:gap-6 md:gap-8 w-max carousel-track">
          {items.map((affiliate, i) => (
            <div
              key={i}
              className="flex items-center justify-center w-50 h-30 rounded-xl border border-gray-200 bg-white px-4 py-3 shrink-0 hover:-translate-y-0.5 transition-transform duration-200"
            >
              <Image
                src={affiliate.logo}
                alt={affiliate.name}
                width={80}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}