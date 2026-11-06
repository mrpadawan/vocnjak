/**
 * External destinations (labels live in lib/strings.ts as links.<id>.label / .hint).
 * Replace the Facebook / Instagram URLs with the community's real profile pages when they are known —
 * the search URLs below are safe fallbacks.
 */
export interface ExternalLink {
  id: 'loznica' | 'weather' | 'facebook' | 'instagram';
  href: string;
}

export const externalLinks: ExternalLink[] = [
  { id: 'loznica', href: 'https://www.loznica.rs' },
  { id: 'weather', href: 'https://www.hidmet.gov.rs' },
  { id: 'facebook', href: 'https://www.facebook.com/search/top?q=Vo%C4%87njak%20Loznica' },
  { id: 'instagram', href: 'https://www.instagram.com/explore/tags/vocnjak/' },
];

/** Approximate coordinates of Loznica used for the live temperature chip. */
export const WEATHER_COORDS = { lat: 44.533, lon: 19.224 };
