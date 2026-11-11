#!/usr/bin/env node
/**
 * Contrast gate.
 *
 * Parses src/styles/tokens.css, composites every text token over its
 * background token, and fails if any text-bearing pair misses its WCAG
 * target. Runs in CI so a future token tweak cannot silently regress
 * readability.
 *
 * Usage: node scripts/check-contrast.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');

/** Pull `--name: value;` declarations out of the :root block. */
function readTokens(source) {
  const tokens = {};
  for (const [, name, value] of source.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) {
    tokens[name] = value.trim();
  }
  return tokens;
}

/** Parse #rgb, #rrggbb, or rgba(r,g,b,a) into {r,g,b,a} with 0-255 channels. */
function parseColor(input) {
  const value = input.trim();

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1];
    const full =
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    };
  }

  const rgba = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const parts = rgba[1].split(',').map((p) => parseFloat(p.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }

  return null;
}

/** Composite a possibly-translucent foreground over an opaque background. */
function composite(fg, bg) {
  return {
    r: fg.a * fg.r + (1 - fg.a) * bg.r,
    g: fg.a * fg.g + (1 - fg.a) * bg.g,
    b: fg.a * fg.b + (1 - fg.a) * bg.b,
    a: 1,
  };
}

/** WCAG 2.x relative luminance. */
function luminance({ r, g, b }) {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(fg, bg) {
  const a = luminance(composite(fg, bg));
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

const tokens = readTokens(css);

/**
 * Each pair declares the minimum ratio it must clear.
 *   4.5 — normal text
 *   3.0 — large text (>=24px, or >=18.7px bold) and UI component boundaries
 *
 * Decorative tokens (--ink-faint, --rule*, --sand-deep) carry no text and
 * are not checked.
 */
const REQUIRED = [
  // Ink on the three surfaces a page is built from.
  { fg: '--ink-strong', bg: '--bg', min: 4.5, note: 'headings on the page' },
  { fg: '--ink-body', bg: '--bg', min: 4.5, note: 'body copy on the page' },
  { fg: '--ink-muted', bg: '--bg', min: 4.5, note: 'captions and meta on the page' },
  { fg: '--ink-strong', bg: '--surface', min: 4.5, note: 'headings on cards' },
  { fg: '--ink-body', bg: '--surface', min: 4.5, note: 'body copy on cards' },
  { fg: '--ink-muted', bg: '--surface', min: 4.5, note: 'captions and meta on cards' },
  { fg: '--ink-strong', bg: '--sand', min: 4.5, note: 'headings on beige bands' },
  { fg: '--ink-body', bg: '--sand', min: 4.5, note: 'body copy on beige bands' },
  { fg: '--ink-muted', bg: '--sand', min: 4.5, note: 'captions on beige bands' },
  { fg: '--sand-ink', bg: '--sand', min: 4.5, note: 'small labels on beige' },
  { fg: '--sand-ink', bg: '--surface', min: 4.5, note: 'beige-ink labels on cards' },

  // The accent, as text and as a fill.
  { fg: '--blue', bg: '--bg', min: 4.5, note: 'links and eyebrows on the page' },
  { fg: '--blue', bg: '--surface', min: 4.5, note: 'links and eyebrows on cards' },
  { fg: '--blue', bg: '--sand', min: 4.5, note: 'links and eyebrows on beige' },
  { fg: '--blue', bg: '--blue-wash', min: 4.5, note: 'icons and text on the lightest tint' },
  { fg: '--blue-strong', bg: '--blue-wash', min: 4.5, note: 'chip text' },
  { fg: '--blue-strong', bg: '--blue-soft', min: 4.5, note: 'text on the tinted fill' },
  { fg: '--ink-inverse', bg: '--blue', min: 4.5, note: 'button text' },
  { fg: '--ink-inverse', bg: '--blue-strong', min: 4.5, note: 'button text, hovered' },
  {
    fg: '--ink-inverse',
    bg: '--blue-deep',
    min: 4.5,
    note: 'text at the dark end of the blue band',
  },
  { fg: '--blue-on-dark', bg: '--blue', min: 4.5, note: 'accent text on the blue band' },
  { fg: '--sand', bg: '--blue', min: 4.5, note: 'the italic accent on the blue band' },
];

let failed = 0;
const rows = [];

for (const { fg, bg, min, note } of REQUIRED) {
  const fgColor = parseColor(tokens[fg]);
  const bgColor = parseColor(tokens[bg]);

  if (!fgColor || !bgColor) {
    console.error(`  UNRESOLVED  ${fg} on ${bg} — could not parse token value`);
    failed++;
    continue;
  }

  const ratio = contrast(fgColor, bgColor);
  const pass = ratio >= min;
  if (!pass) failed++;

  rows.push({
    pair: `${fg} on ${bg}`,
    ratio: ratio.toFixed(2) + ':1',
    required: min.toFixed(1) + ':1',
    status: pass ? 'pass' : 'FAIL',
    note,
  });
}

const width = Math.max(...rows.map((r) => r.pair.length));
console.log('\nContrast gate — WCAG 2.2 AA\n');
for (const r of rows) {
  const mark = r.status === 'pass' ? '  ok ' : ' FAIL';
  console.log(
    `${mark}  ${r.pair.padEnd(width)}  ${r.ratio.padStart(8)}  (needs ${r.required})  ${r.note}`
  );
}

if (failed > 0) {
  console.error(
    `\n${failed} contrast requirement(s) not met.\n` +
      `Darken the text token or lighten the surface in src/styles/tokens.css.\n`
  );
  process.exit(1);
}

console.log(`\nAll ${rows.length} text pairs meet AA.\n`);
