/**
 * The site search index.
 *
 * Search runs entirely in the browser against one small JSON file, built
 * here at build time from the same content collections the pages render.
 * A page, guide, event or person therefore becomes searchable the moment
 * it exists — there is no separate list to keep in step, and no search
 * service to run.
 *
 * Each entry is deliberately small: a title, a URL, a kind, a line of
 * description, and a bag of extra words that should find it (tags, body
 * text, people's affiliations) without being shown.
 */
import { getCollection } from 'astro:content';

import { CONTACTS, JOIN_HREF, SITE } from '../data/site';
import { getOrg } from '../data/orgs';
import { getPublicRepos } from './github';
import { memberPath } from './routes';

/** Result groups, in the order they rank when scores tie. */
export const SEARCH_KINDS = [
  'Page',
  'Project',
  'Event',
  'Guide',
  'Member',
  'Partner',
  'Repository',
] as const;

export type SearchKind = (typeof SEARCH_KINDS)[number];

export interface SearchEntry {
  /** Title, shown and matched first. */
  t: string;
  /** URL. Site-relative unless `x` is set. */
  u: string;
  /** Kind, shown as the result's label. */
  k: SearchKind;
  /** One line of description, shown under the title. */
  d: string;
  /** Extra words that should match but are not displayed. */
  w: string;
  /** External link: opens away from the site. */
  x?: true;
}

/** How much body text to index per page. Plenty for these posts. */
const BODY_LIMIT = 6000;

/**
 * Reduce markdown / MDX source to the words a reader would see.
 * Good enough for matching; this never renders anywhere.
 */
function plainText(source: string | undefined): string {
  if (!source) return '';
  return (
    source
      // fenced code and MDX import/export lines
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^(import|export)\s.*$/gm, ' ')
      // images, then links (keep the label)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // JSX expression attributes, then tags
      .replace(/=\{[\s\S]*?\}\s*(?=\/?>|\w+=)/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      // entities and markdown punctuation
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/g, ' ')
      .replace(/[#*_`>|~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, BODY_LIMIT)
  );
}

const words = (...parts: (string | undefined | null | false)[]) => parts.filter(Boolean).join(' ');

/** The fixed pages and the sections of them worth landing on directly. */
function staticEntries(): SearchEntry[] {
  return [
    {
      t: 'Home',
      u: '/',
      k: 'Page',
      d: 'What ESRA is, and the robots it is building.',
      w: words(
        SITE.fullName,
        SITE.description,
        'about mission nonprofit association student robotics start overview'
      ),
    },
    {
      t: 'Why ESRA',
      u: '/#why',
      k: 'Page',
      d: 'The problem ESRA exists to solve, and how a joint build works.',
      w: 'about mission purpose joint build integration session how it works why the model works who does what roles universities labs companies',
    },
    {
      t: 'Get involved',
      u: JOIN_HREF,
      k: 'Page',
      d: 'Four ways in: students, partner clubs, labs and companies.',
      w: 'join sign up apply volunteer students engineering computer science business marketing partner club lab research mentor company sponsor sponsorship levels bronze silver gold platinum industry research alliance',
    },
    {
      t: 'Projects',
      u: '/projects',
      k: 'Page',
      d: 'The roadmap, workshop builds, and every open-source repository.',
      w: 'open source hardware software code repos github roadmap',
    },
    {
      t: 'Roadmap',
      u: '/projects#roadmap',
      k: 'Page',
      d: 'The robots ESRA is building in 2026–27.',
      w: 'upcoming planned programmes programs humanoid quadruped manipulator schedule',
    },
    {
      t: 'Inside H1',
      u: '/projects#inside-h1',
      k: 'Page',
      d: 'How H1 is built across universities, and what happens at an integration session.',
      w: 'h1 humanoid how it is built baseline subsystems parts engineers integration session two weeks in person telemetry calibration experiments datasets',
    },
    {
      t: 'Open documentation',
      u: '/projects#open-documentation',
      k: 'Page',
      d: 'What every release includes, and the technical papers and reports.',
      w: 'open source documentation rebuild cad bill of materials bom electronics source code setup instructions calibration procedures test resources versioned releases reports papers build guide industry research alliance',
    },
    {
      t: 'Repositories',
      u: '/projects#repositories',
      k: 'Page',
      d: 'Open-source code and hardware, live from GitHub.',
      w: 'github repos code source open source',
    },
    {
      t: 'Events',
      u: '/events',
      k: 'Page',
      d: 'Featured events and the ESRA calendar.',
      w: 'calendar schedule dates workshop meetup conference upcoming integration session newsletter blog progress posts progress reports what we publish',
    },
    {
      t: 'Calendar',
      u: '/events#calendar',
      k: 'Page',
      d: 'The public ESRA calendar. Subscribe in Google Calendar or any iCal app.',
      w: 'google calendar ical ics subscribe schedule dates meetings',
    },
    {
      t: 'Guides',
      u: '/docs',
      k: 'Page',
      d: 'Build notes and procedures you can follow from outside the group.',
      w: 'docs documentation field guides how to tutorial instructions build',
    },
    {
      t: 'Members',
      u: '/members',
      k: 'Page',
      d: 'The people building ESRA, and the clubs and schools in the network.',
      w: 'team people roster directory who staff directors partners clubs schools',
    },
    {
      t: 'Partners',
      u: '/members#partners',
      k: 'Page',
      d: 'The clubs and schools in the network.',
      w: 'clubs schools universities affiliated network companies organizations',
    },
    {
      t: 'Contact',
      u: '/contact',
      k: 'Page',
      d: 'Email addresses and the channels where ESRA posts.',
      w: words(
        'email mail reach message press partnerships social linkedin youtube github',
        ...CONTACTS.map((c) => `${c.address} ${c.label}`)
      ),
    },
    {
      t: 'Colophon',
      u: '/colophon',
      k: 'Page',
      d: 'How this site is built, and what it is built from.',
      w: 'about this site design typography fonts colour color astro source build',
    },
  ];
}

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const [docs, projects, programs, events, members, partners, repos] = await Promise.all([
    getCollection('docs'),
    getCollection('projects'),
    getCollection('programs'),
    getCollection('events'),
    getCollection('members'),
    getCollection('partners'),
    getPublicRepos(),
  ]);

  const entries: SearchEntry[] = staticEntries();

  for (const program of [...programs].sort((a, b) => a.data.order - b.data.order)) {
    const p = program.data;
    entries.push({
      t: p.title,
      u: `/projects#${program.id}`,
      k: 'Project',
      d: p.summary,
      w: words(
        p.designation,
        p.kind,
        p.level,
        p.status,
        p.timeframe,
        p.description,
        p.focus.join(' '),
        p.outputs.join(' '),
        p.milestones.map((m) => `${m.title} ${m.body}`).join(' '),
        'roadmap programme program robot'
      ),
    });
  }

  for (const project of projects.filter((p) => !p.data.draft)) {
    const p = project.data;
    entries.push({
      t: p.title,
      u: `/projects/${project.id}`,
      k: 'Project',
      d: p.summary,
      w: words(p.status, p.revision, p.domains.join(' '), p.repo, plainText(project.body)),
    });
  }

  for (const event of events.filter((e) => !e.data.draft)) {
    const e = event.data;
    entries.push({
      t: e.title,
      u: `/events#${event.id}`,
      k: 'Event',
      d: words(e.when, e.location && `· ${e.location}`),
      w: words(e.kicker, e.format, e.summary, e.highlights.join(' ')),
    });
  }

  for (const doc of docs.filter((d) => !d.data.draft)) {
    entries.push({
      t: doc.data.title,
      u: `/docs/${doc.id}`,
      k: 'Guide',
      d: doc.data.description ?? 'Field guide',
      w: words(doc.data.duration, plainText(doc.body)),
    });
  }

  for (const member of members.filter((m) => !m.data.inactive)) {
    const m = member.data;
    const roles = m.roles
      .map((r) => words(r.title, getOrg(r.org)?.name ?? r.org))
      .filter(Boolean)
      .join(', ');
    entries.push({
      t: m.name,
      u: memberPath(member),
      k: 'Member',
      d: words(m.affiliation) || roles || 'ESRA member',
      w: words(m.discipline, roles, m.handle, plainText(member.body)),
    });
  }

  for (const partner of partners) {
    const p = partner.data;
    entries.push({
      t: p.name,
      u: p.url,
      k: 'Partner',
      d: [p.school !== p.name && p.school, p.location].filter(Boolean).join(' · '),
      w: words(p.abbr, p.kind, p.school, p.location, 'partner club school network'),
      x: true,
    });
  }

  for (const repo of repos) {
    entries.push({
      t: repo.name,
      u: repo.url,
      k: 'Repository',
      d: repo.description ?? 'Repository on GitHub',
      w: words(repo.fullName, repo.language, repo.topics.join(' '), 'github repo code source'),
      x: true,
    });
  }

  return entries;
}
