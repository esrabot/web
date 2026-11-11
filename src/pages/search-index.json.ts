/**
 * /search-index.json — the search index, generated at build time.
 *
 * Fetched by the search dialog the first time it is opened, and by the
 * /search page. See src/lib/search-index.ts for what goes into it.
 */
import type { APIRoute } from 'astro';

import { buildSearchIndex } from '../lib/search-index';

export const GET: APIRoute = async () => {
  const entries = await buildSearchIndex();

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
