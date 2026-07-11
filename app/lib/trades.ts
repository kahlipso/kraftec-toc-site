// The trades Kraftec covers. Shared so the homepage categories and the
// Find Your Pro page use the same slugs (which also match the icon filenames in
// public/category-icons/<slug>.svg).

export type Trade = { name: string; slug: string };

export const trades: Trade[] = [
  { name: 'Handyperson', slug: 'handyperson' },
  { name: 'Landscaping', slug: 'landscaping' },
  { name: 'Plumbing', slug: 'plumbing' },
  { name: 'Electrical', slug: 'electrical' },
  { name: 'Remodeling', slug: 'remodeling' },
  { name: 'Roofing', slug: 'roofing' },
  { name: 'Painting', slug: 'painting' },
  { name: 'Cleaning', slug: 'cleaning' },
  { name: 'HVAC', slug: 'hvac' },
  { name: 'Windows', slug: 'windows' },
  { name: 'Concrete', slug: 'concrete' },
];

export function isTrade(slug: string | undefined): slug is string {
  return !!slug && trades.some((t) => t.slug === slug);
}
