/**
 * Top-level paths that a member vanity slug must not take.
 *
 * Plain .mjs rather than .ts so both the Astro build and the Node
 * validation script can import the same list — a second copy would
 * inevitably drift, and the whole point is that the two agree.
 */
export const RESERVED_ROUTES = new Set([
  // pages
  'members',
  'projects',
  'docs',
  'events',
  'search',
  'contact',
  'colophon',
  '404',
  'partner',
  // removed sections, redirected home in vercel.json — a redirect wins
  // over a page, so a member slug here would never be reachable
  'blog',
  'gallery',
  'rss.xml',
  'feed-media',
  // endpoints and generated output
  'search-index.json',
  'logos',
  'og',
  'api',
  '_astro',
  '_vercel',
  '_image',
  // static files in public/
  'admin',
  'media',
  'favicon.svg',
  'favicon.ico',
  'robots.txt',
  'og-default.png',
  'sitemap-index.xml',
  'sitemap-0.xml',
  // plausible future routes, reserved pre-emptively so a member slug never
  // has to be taken away from someone later
  'about',
  'join',
  'sponsors',
  'sponsor',
  'partners',
  'calendar',
  'tags',
  'feed',
  'rss',
  'team',
  'hardware',
  'guides',
  'wiki',
  'shop',
  'donate',
]);
