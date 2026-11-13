/**
 * Runs on every page as it renders, at build time and in dev.
 *
 * Its one job: make links that leave the site open in a new tab. The
 * rule lives in lib/external-links.ts.
 */
import { defineMiddleware } from 'astro:middleware';

import { openExternalLinksInNewTab } from './lib/external-links';
import { SITE_URL } from './data/site';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;

  const html = await response.text();
  const hosts = [new URL(SITE_URL).host, context.url.host];

  const headers = new Headers(response.headers);
  headers.delete('content-length');

  return new Response(openExternalLinksInNewTab(html, hosts), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
