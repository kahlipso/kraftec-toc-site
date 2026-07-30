// Naming the city of a point, in Google's own words — shared by the Places
// lookup (an address the visitor searched) and the reverse geocoder (the
// default map center), which hand back the same components under two shapes.

/**
 * Most specific first. A city is normally `locality`; unincorporated areas and
 * some CDPs only carry a sublocality or a level-3 admin area, so fall through.
 */
const CITY_TYPES = [
  'locality',
  'postal_town',
  'sublocality',
  'administrative_area_level_3',
  'neighborhood',
];

export type CityComponent = { types: readonly string[]; name: string | null };

/** The best city-like name in a flat list of address components, or null. */
export function pickCity(components: CityComponent[]): string | null {
  for (const type of CITY_TYPES) {
    const match = components.find((c) => c.types.includes(type) && c.name);
    if (match) return match.name;
  }
  return null;
}
