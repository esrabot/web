#!/usr/bin/env node
/**
 * Content validation with human-readable errors.
 *
 * Astro already validates frontmatter against the Zod schemas at build
 * time, but a raw Zod failure is close to unreadable if you have never
 * seen one. This runs first and reports the same problems in plain
 * English, naming the file, the field, and what to do about it — so a
 * contributor who has only ever written markdown can fix their own
 * content from the CI log without asking anyone.
 *
 * Run: pnpm validate:content
 */

import { readdir, readFile, access } from 'node:fs/promises';
import { join, extname, dirname, resolve, relative } from 'node:path';
import { parse as parseYaml } from 'yaml';

import { RESERVED_ROUTES } from '../src/lib/reserved-routes.mjs';

const problems = [];
const notes = [];

function fail(file, message, hint) {
  problems.push({ file, message, hint });
}

/** Split a markdown file into frontmatter and body. */
function splitFrontmatter(raw) {
  // Files saved on Windows end lines in \r\n; a stray \r left after a value
  // like `links: []` is not valid YAML, though Astro reads the file fine.
  raw = raw.replace(/\r\n/g, '\n');
  if (!raw.startsWith('---')) return { frontmatter: null, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: null, body: raw };
  return {
    frontmatter: raw.slice(3, end),
    body: raw.slice(end + 4),
  };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir, exts) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const out = [];
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...(await listFiles(path, exts)));
      else if (exts.includes(extname(entry.name))) out.push(path);
    }
    return out;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------
const memberFiles = await listFiles('src/content/members', ['.md', '.mdx']);

/** slug -> file, so a collision can name both sides. */
const memberSlugs = new Map();

for (const file of memberFiles) {
  const raw = await readFile(file, 'utf8');
  const { frontmatter } = splitFrontmatter(raw);

  if (!frontmatter) {
    fail(file, 'has no frontmatter block', 'Start the file with a --- line.');
    continue;
  }

  let data;
  try {
    data = parseYaml(frontmatter);
  } catch (err) {
    fail(file, `frontmatter is not valid YAML — ${err.message}`, yamlHint(err));
    continue;
  }

  if (!data?.name) {
    fail(file, 'is missing `name`', 'Add a line like:  name: Jane Doe');
  }

  for (const link of data?.links ?? []) {
    if (!link?.url) {
      fail(file, 'has a link with no `url`', 'Every entry under `links:` needs a url.');
    }
  }

  if (data?.avatar) {
    const target = resolve(dirname(file), data.avatar);
    if (!(await exists(target))) {
      fail(
        file,
        `\`avatar\` points at a file that does not exist: ${data.avatar}`,
        `Expected to find: ${relative(process.cwd(), target)}`
      );
    }
  }

  // Member pages are served from the site root (esra.bot/your-handle), so a
  // slug shares a namespace with every real route. Catch clashes here,
  // where the message can explain the problem.
  const slug =
    data?.handle ??
    file
      .split('/')
      .pop()
      .replace(/\.mdx?$/, '');

  if (RESERVED_ROUTES.has(slug.toLowerCase())) {
    fail(
      file,
      `uses the URL slug "${slug}", which is a reserved site route`,
      `Member pages live at the site root, so /${slug} is already taken.\n` +
        'Add a different `handle:` to the frontmatter, e.g.  handle: your-name'
    );
  }

  if (data?.handle && !/^[a-z0-9][a-z0-9-]*$/.test(data.handle)) {
    fail(
      file,
      `has an invalid \`handle\`: "${data.handle}"`,
      'Use lowercase letters, numbers and hyphens only, e.g.  handle: your-handle'
    );
  }

  const clash = memberSlugs.get(slug);
  if (clash) {
    fail(
      file,
      `resolves to the same URL as ${clash}: /${slug}`,
      'Two members cannot share a slug. Set a distinct `handle:` on one of them.'
    );
  }
  memberSlugs.set(slug, file);
}

// ---------------------------------------------------------------------
// YAML data files
// ---------------------------------------------------------------------
for (const file of [
  'src/content/partners.yaml',
  'src/content/featured.yaml',
  'src/content/programs.yaml',
  'src/content/events.yaml',
  'src/content/pathways.yaml',
]) {
  if (!(await exists(file))) continue;
  try {
    const rows = parseYaml(await readFile(file, 'utf8'));
    if (!Array.isArray(rows)) {
      fail(file, 'should be a list of entries', 'Each entry starts with "- id: ..."');
      continue;
    }
    const seen = new Set();
    for (const row of rows) {
      if (!row?.id) {
        fail(file, 'has an entry with no `id`', 'Every entry needs a unique id.');
        continue;
      }
      if (seen.has(row.id)) {
        fail(file, `has two entries with the id "${row.id}"`, 'Ids must be unique.');
      }
      seen.add(row.id);
    }
  } catch (err) {
    fail(file, `is not valid YAML — ${err.message}`, yamlHint(err));
  }
}

// ---------------------------------------------------------------------
// BOMs
// ---------------------------------------------------------------------
for (const file of await listFiles('src/content/boms', ['.yaml', '.yml'])) {
  try {
    const data = parseYaml(await readFile(file, 'utf8'));
    if (!data?.title) fail(file, 'is missing `title`', 'Add a title for the BOM.');
    if (!Array.isArray(data?.lines)) {
      fail(file, 'is missing `lines`', 'A BOM needs a `lines:` list of parts.');
    } else {
      data.lines.forEach((line, i) => {
        if (!line?.item) {
          fail(file, `line ${i + 1} has no \`item\``, 'Every line needs an item name.');
        }
      });
    }
  } catch (err) {
    fail(file, `is not valid YAML — ${err.message}`, yamlHint(err));
  }
}

/** The YAML mistake people actually make, called out specifically. */
function yamlHint(err) {
  if (/mapping/i.test(err.message)) {
    return (
      'This usually means a value contains a colon followed by a space.\n' +
      'Wrap the whole value in quotes, e.g.\n' +
      '    summary: "Prototype: leg test stand."'
    );
  }
  return 'Check indentation — YAML uses spaces, never tabs.';
}

// ---------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------
if (notes.length > 0) {
  console.log('\nSuggestions (these do not fail the build):\n');
  for (const note of notes) console.log(`  · ${note}`);
}

if (problems.length === 0) {
  console.log(`\nContent OK — ${memberFiles.length} members checked.\n`);
  process.exit(0);
}

console.error(`\n${problems.length} problem(s) found in content:\n`);
for (const { file, message, hint } of problems) {
  console.error(`  ${file}`);
  console.error(`    ${message}`);
  if (hint) {
    for (const line of hint.split('\n')) console.error(`    ${line}`);
  }
  console.error('');
}
console.error('Fix the files above and commit again. Nothing else needs to change.\n');
process.exit(1);
