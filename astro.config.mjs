// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';

/**
 * Canonical origin. Every absolute URL on the site (sitemap, OG tags)
 * derives from this single value — switching domains is a one-line change.
 * Vercel preview deploys override it so previews self-reference correctly.
 */
const SITE_URL =
  process.env.SITE_URL ??
  (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://esra.bot');

export default defineConfig({
  site: SITE_URL,
  adapter: vercel({
    // Static output — the whole site prerenders. The adapter is here for
    // Vercel's image optimizer and correct routing, not for SSR.
    imageService: true,
  }),
  output: 'static',

  // Matches the old Nuxt site's `autoSubfolderIndex: false`, so migrated
  // URLs resolve without a redirect hop.
  trailingSlash: 'never',

  integrations: [
    mdx(),
    icon({
      include: {
        'simple-icons': [
          'github',
          'linkedin',
          'youtube',
          'instagram',
          'x',
          'bluesky',
          'gmail',
          'kicad',
        ],
        // Every lucide icon a template names must be listed here, or it
        // will not be bundled. `grep -rhoE "lucide:[a-z0-9-]+" src` lists them.
        lucide: [
          'arrow-down',
          'arrow-left',
          'arrow-right',
          'arrow-up-right',
          'book-open',
          'building-2',
          'calendar',
          'calendar-days',
          'calendar-plus',
          'check',
          'chevron-down',
          'chevron-left',
          'chevron-right',
          'clock',
          'copy',
          'external-link',
          'flag',
          'flask-conical',
          'globe',
          'graduation-cap',
          'handshake',
          'layers',
          'mail',
          'map-pin',
          'play',
          'plus',
          'search',
          'user',
          'users',
          'wrench',
          'x',
          'zoom-in',
        ],
      },
    }),
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ],

  markdown: {
    shikiConfig: {
      // Light-only: the site has a single paper-toned theme by design.
      theme: 'github-light',
      wrap: false,
    },
  },

  image: {
    // Generated derivatives stay modest; the source photos are multi-megabyte.
    responsiveStyles: true,
    layout: 'constrained',
  },

  build: {
    inlineStylesheets: 'auto',
  },

  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
