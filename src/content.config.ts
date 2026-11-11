import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import type { ZodType } from 'astro/zod';

/**
 * Content collections.
 *
 * These schemas are the contract for anyone adding content. They are
 * intentionally forgiving where a contributor might reasonably vary
 * (dates as strings, a single author or a list) and strict where a
 * mistake would ship broken — an unknown author ID or a missing image
 * fails the build with a named error rather than rendering an empty slot.
 *
 * Ported from the old Nuxt site's schema/*.ts, with the fixes noted below.
 */

const members = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/members' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** Sort key. */
      order: z.number().default(100),

      /**
       * Vanity URL. `handle: willcforte` publishes the record at
       * esra.bot/willcforte rather than esra.bot/will-forte.
       *
       * Deliberately NOT called `slug`: that is a reserved frontmatter key
       * in Astro content collections and silently overrides the entry id,
       * which breaks every `authors:` reference pointing at the file.
       *
       * These live at the site root, so a handle must not collide with a
       * real route — scripts/validate-content.mjs enforces that against
       * the reserved list and fails the build on a clash.
       */
      handle: z
        .string()
        .regex(
          /^[a-z0-9][a-z0-9-]*$/,
          'must be lowercase letters, numbers and hyphens, starting with a letter or number'
        )
        .optional(),

      /** Discipline, e.g. "Mechanical" / "Software". */
      discipline: z.string().optional(),

      /**
       * Roles across organisations. Modelled as a list because several
       * people hold positions in more than one org (co-president of
       * Rutgers Dynamics AND co-director of ESRA).
       */
      roles: z
        .array(
          z.object({
            org: z.string(),
            title: z.string().optional(),
          })
        )
        .default([]),

      /** Free-text school/club line shown under the name. */
      affiliation: z.string().optional(),

      avatar: image().optional(),
      pronouns: z.string().optional(),

      links: z
        .array(
          z.object({
            platform: z.enum([
              'website',
              'github',
              'linkedin',
              'youtube',
              'instagram',
              'x',
              'bluesky',
              'email',
              'linktree',
            ]),
            handle: z.string().optional(),
            url: z.string(),
          })
        )
        .default([]),

      /** Hide from the roster without deleting the record. */
      inactive: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      /**
       * `owner/name` on GitHub. When set, stars, language, last commit,
       * and topics are fetched at build time — never hand-maintained.
       */
      repo: z.string().optional(),
      status: z.enum(['active', 'prototype', 'shipped', 'archived']).default('active'),
      /** Discipline tags: cad, pcb, firmware, rl, sim, web. */
      domains: z.array(z.string()).default([]),
      cover: image().optional(),
      /** Hardware revision, e.g. "rev D". */
      revision: z.string().optional(),
      links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
      /** Bill of materials, by BOM collection ID. */
      bom: reference('boms').optional(),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

/**
 * Partners are a flat YAML list rather than a file per entry: short
 * records that read better as one editable table. The `file()` loader
 * parses a top-level array natively as long as each row carries an `id`.
 */
const partners = defineCollection({
  loader: file('./src/content/partners.yaml'),
  schema: z.object({
    name: z.string(),
    /** Club abbreviation, e.g. CRT, CURC, RMC. */
    abbr: z.string().optional(),
    school: z.string(),
    location: z.string().optional(),
    url: z.string(),
    /** What the partner is. Shown as a label beside its name. */
    kind: z.enum(['club', 'school', 'company', 'organization']).default('club'),
    /**
     * File name under src/assets/logos (PNG, SVG, JPG or WebP, any
     * colours). It is redrawn in the site's own ink at build time — see
     * src/lib/logo-mark.ts. Absent for partners with no logo yet, which
     * get a lettered mark instead.
     */
    logo: z.string().optional(),
    /** Swap ink and knockout if the redrawn logo comes out as a negative. */
    logoInvert: z.boolean().default(false),
  }),
});

/**
 * Bills of materials. A first-class content type because open hardware is
 * only reproducible if the parts list is published with the design.
 */
const boms = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml,json}', base: './src/content/boms' }),
  schema: z.object({
    title: z.string(),
    /** What this BOM builds. */
    subject: z.string().optional(),
    updated: z.coerce.date().optional(),
    currency: z.string().default('USD'),
    notes: z.string().optional(),
    lines: z.array(
      z.object({
        vendor: z.string().optional(),
        item: z.string(),
        /** Free text: quantities here are often expressions ("9 x 3 = 27"). */
        qty: z.union([z.string(), z.number()]).optional(),
        unitPrice: z.number().optional(),
        unitQty: z.number().optional(),
        notes: z.string().optional(),
        purchased: z.boolean().default(false),
        /** Product page, datasheet, CAD model, etc. */
        links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
      })
    ),
  }),
});

/**
 * The home page showcase.
 *
 * A hand-curated strip that sits above the auto-generated repo and video
 * tiles, so anything worth surfacing — a LinkedIn post, a talk, an
 * external write-up — can be featured without touching a component.
 * Reorder or retire an item by editing one YAML file.
 */
const featured = defineCollection({
  loader: file('./src/content/featured.yaml'),
  schema: z.object({
    type: z.enum(['linkedin', 'youtube', 'repo', 'link']),
    title: z.string(),
    /** Short line under the title. */
    summary: z.string().optional(),
    date: z.coerce.date().optional(),

    /**
     * LinkedIn activity URN id — the digits from
     * urn:li:activity:<id>, which appear in the post's URL.
     */
    activityId: z.string().optional(),
    /** For youtube: the 11-character video id. */
    videoId: z.string().optional(),
    /** For repo: owner/name. */
    repo: z.string().optional(),
    /** Canonical link, and the fallback for every type. */
    url: z.string(),

    /** Hide without deleting. */
    draft: z.boolean().default(false),
    order: z.number().default(100),
  }),
});

/**
 * An optional field that also treats a blank value as absent. The content
 * editor at /admin can save a field it left empty as '' (or an empty
 * object), and an empty date would otherwise fail the build.
 */
const isBlank = (v: unknown): boolean =>
  v === '' ||
  v === null ||
  (typeof v === 'object' &&
    !(v instanceof Date) &&
    Object.values(v as object).every((x) => x === '' || x === null || x === undefined));

const blank = <T extends ZodType>(schema: T) =>
  z.preprocess((v) => (isBlank(v) ? undefined : v), schema.optional());

/**
 * The roadmap: the robots ESRA is building or has committed to build.
 *
 * Shown on the home page and at the top of /projects. A programme's
 * `milestones` also feed the schedule on the home page and the "on the
 * horizon" list on /events, so a date is only ever written down once.
 */
const programs = defineCollection({
  loader: file('./src/content/programs.yaml'),
  schema: z.object({
    title: z.string(),
    /** Short designation set large on its card, e.g. "H1". */
    designation: blank(z.string()),
    /** Humanoid, Quadruped, Manipulator. */
    kind: z.string(),
    status: z.enum(['active', 'planned', 'complete']).default('planned'),
    /** Who it suits or where it sits: "Flagship", "Beginner", "Advanced". */
    level: blank(z.string()),
    /** The flagship gets the wide card and the full specification. */
    flagship: z.boolean().default(false),
    summary: z.string(),
    description: blank(z.string()),
    /** Human-readable span, e.g. "Nov 2026 – Jun 2027". */
    timeframe: blank(z.string()),
    /** Subsystems or focus areas. */
    focus: z.array(z.string()).default([]),
    /** What the programme publishes. */
    outputs: z.array(z.string()).default([]),
    milestones: z
      .array(
        z.object({
          /**
           * Only places the "now" marker; the label a reader sees is
           * `when`, the season the roadmap actually commits to.
           */
          starts: z.coerce.date(),
          when: z.string(),
          title: z.string(),
          body: z.string(),
        })
      )
      .default([]),
    order: z.number().default(100),
  }),
});

/**
 * Events worth a card of their own on /events. Day-to-day scheduling
 * lives in the public Google Calendar embedded on the same page; this
 * list is for the few big ones that deserve a write-up.
 */
const events = defineCollection({
  loader: file('./src/content/events.yaml'),
  schema: z.object({
    title: z.string(),
    /** Small line above the title, e.g. the programme it belongs to. */
    kicker: blank(z.string()),
    summary: z.string(),
    /** Sorts the event and decides whether it is upcoming, on now, or past. */
    start: z.coerce.date(),
    end: blank(z.coerce.date()),
    /** What a reader sees: "November 2026", "Jan 16–18, 2027". */
    when: z.string(),
    location: blank(z.string()),
    /** Workshop, Build milestone, Conference, Meetup… */
    format: blank(z.string()),
    /** Featured events get the large card. */
    featured: z.boolean().default(false),
    /** Optional photo, as a path under src/assets (e.g. events/foo.jpg). */
    image: blank(z.string()),
    imageAlt: blank(z.string()),
    highlights: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

/**
 * The ways to get involved. Each one is a card on the home page and the
 * pop-up that opens from it.
 */
const pathways = defineCollection({
  loader: file('./src/content/pathways.yaml'),
  schema: z.object({
    order: z.number().default(100),
    /** Who it is for, in two or three words. */
    audience: z.string(),
    title: z.string(),
    lede: z.string(),
    /** Which pictogram the card carries. */
    icon: z.enum(['team', 'affiliate', 'industry']),
    /** The three lines on the card itself. */
    points: z.array(z.string()),
    /** Opening paragraph of the pop-up. */
    intro: z.string(),
    /** Headed lists in the pop-up: who it suits, what it involves… */
    sections: z.array(z.object({ heading: z.string(), items: z.array(z.string()) })),
    /** An optional highlighted aside in the pop-up. */
    note: blank(z.object({ label: z.string().min(1), body: z.string().min(1) })),
    /** How to take the first step. */
    start: z.string(),
    /** Button label, and the subject line of the email it starts. */
    cta: z.string(),
    subject: z.string(),
  }),
});

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().default(100),
    /** Estimated reading/working time, e.g. "14 min". */
    duration: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  members,
  projects,
  partners,
  boms,
  docs,
  featured,
  programs,
  events,
  pathways,
};
