import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-32 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#d01111]">Work order not found</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-black">
        We couldn&apos;t find that job
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-500">
        The work order you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/work"
        className="mt-6 rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d01111]/90"
      >
        Browse recent work →
      </Link>
    </div>
  );
}
