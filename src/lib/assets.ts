/**
 * Asset resolution for content authors.
 *
 * Contributors write image paths the way they think about them —
 * `uploads/workshop.jpg` — rather than importing modules. This maps
 * those paths onto the processed assets so they still go through Astro's
 * optimiser.
 *
 * Eagerly globbed because content collections resolve synchronously at
 * build time; the cost is build-time only.
 */
import type { ImageMetadata } from 'astro';

const assets = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{jpg,jpeg,png,webp,avif,svg}',
  { eager: true }
);

/** Normalised lookup: 'uploads/foo.jpg' -> ImageMetadata */
const bySubpath = new Map<string, ImageMetadata>();

for (const [path, mod] of Object.entries(assets)) {
  bySubpath.set(path.replace('/src/assets/', ''), mod.default);
}

/**
 * Resolve an author-written path to processed image metadata.
 * Returns undefined for absolute URLs and /public paths, which are
 * served as-is and need no processing.
 */
export function resolveAsset(src: string): ImageMetadata | undefined {
  if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return undefined;
  return bySubpath.get(src.replace(/^\.?\//, ''));
}

/**
 * Resolve or throw. Used where a missing image should fail the build
 * rather than render an empty box — a typo in a path is otherwise
 * invisible until someone notices a blank figure in production.
 */
export function requireAsset(src: string, context: string): ImageMetadata {
  const found = resolveAsset(src);
  if (!found) {
    const available = [...bySubpath.keys()].slice(0, 8).join('\n  ');
    throw new Error(
      `${context}: no asset at "${src}".\n` +
        `Expected a file under src/assets/ — e.g. src/assets/${src}\n` +
        `Some available paths:\n  ${available}`
    );
  }
  return found;
}

export function listAssets(): string[] {
  return [...bySubpath.keys()].sort();
}
