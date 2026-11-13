/**
 * Site-wide constants. Anything that would otherwise be hardcoded into a
 * template lives here.
 */

import { ESRA } from './orgs';

/**
 * Canonical origin. Mirrors the value in astro.config.mjs — that one feeds
 * the sitemap, this one is for runtime template use.
 */
export const SITE_URL = import.meta.env.SITE ?? process.env.SITE_URL ?? 'https://esra.bot';

export const SITE = {
  name: ESRA.name,
  fullName: ESRA.fullName,
  title: 'ESRA — Experimental Student Robotics Association',
  description: ESRA.blurb!,
  /** Used in the footer and on the home page. */
  established: 'ICRA 2025',
  /**
   * Legal status, from the incorporation record.
   * TODO(confirm): incorporated on May 28 or in June 2026? Until it is
   * settled, the line gives the year alone.
   */
  incorporated: 'New Jersey nonprofit, 2026',
  /** Federal tax status. Shown in the footer and the home page's facts. */
  taxStatus: '501(c)(3)',
  license: 'MIT + CERN-OHL-S',
  repo: 'esrabot/web',
  repoUrl: 'https://github.com/esrabot/web',
  orgUrl: 'https://github.com/esrabot',
} as const;

/**
 * Contact addresses, in the order the contact page lists them. The first
 * is the general inbox that every "email us" link falls back to.
 *
 * These are mailboxes on Zoho Mail (free plan for now), and they are the
 * only email addresses that should appear anywhere on the site — do not
 * invent role addresses that no one is reading. Adding a new mailbox is a
 * one-line edit here once it exists in Zoho.
 *
 * TODO(confirm): partnerships@ and marketing@ may not exist in Zoho yet.
 * Create them before this ships, or point these entries (and the buttons
 * in src/content/pathways.yaml that use them) at info@ until they do.
 *
 * Receive-only aliases (press@, join@, …) can be added later; see
 * docs/operations.md for why they must live in Zoho rather than Cloudflare
 * Email Routing while Zoho holds the domain's MX records.
 */
export const CONTACTS: { address: string; label: string; note: string }[] = [
  {
    address: 'info@esra.bot',
    label: 'General',
    note: 'Introductions, press, and anything that has no better home.',
  },
  {
    address: 'engineering@esra.bot',
    label: 'Engineering',
    note: 'Hardware, software, the open designs, and project timelines. Students who want to build start here.',
  },
  {
    // TODO(confirm): mailbox exists in Zoho; until it does, use info@esra.bot.
    address: 'partnerships@esra.bot',
    label: 'Partnerships',
    note: 'Companies and research labs: sponsorship, mentoring and joint research.',
  },
  {
    // TODO(confirm): mailbox exists in Zoho; until it does, use info@esra.bot.
    address: 'marketing@esra.bot',
    label: 'Marketing',
    note: 'Business and marketing students who want to join, and media.',
  },
];

/**
 * Primary navigation, in the order it reads across the header. Search and
 * the "Get involved" button sit after it and are not part of this list.
 */
/** `accent` keeps a link's text blue at all times, not just on hover. */
export const NAV: { label: string; href: string; accent?: boolean }[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'Events', href: '/events' },
  { label: 'Guides', href: '/docs' },
  { label: 'Members', href: '/members' },
  { label: 'Contact', href: '/contact', accent: true },
];

/** Where every "Get involved" button points: the ways-in section on Home. */
export const JOIN_HREF = '/#join';

/**
 * The public ESRA events calendar (Google Calendar).
 *
 * Only the calendar's id is written down. The embed, the "add to Google
 * Calendar" link and the iCal feed are all derived from it, so pointing
 * the site at a different calendar is a one-line change.
 */
const CALENDAR_ID =
  'c_6e3047bccf9f44154b27291d78a6d02381dac28351773c495e63fe5dfdc763c0@group.calendar.google.com';
const CALENDAR_TZ = 'America/New_York';

const calendarId = encodeURIComponent(CALENDAR_ID);
const calendarTz = encodeURIComponent(CALENDAR_TZ);
const icalPath = `calendar.google.com/calendar/ical/${calendarId}/public/basic.ics`;

export const CALENDAR = {
  timezone: CALENDAR_TZ,
  timezoneLabel: 'Eastern Time',
  /** The calendar's own public page. */
  publicUrl: `https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=${calendarTz}`,
  /** The iframe source: a month grid on wide screens, an agenda on narrow ones. */
  embedUrl: (mode: 'MONTH' | 'AGENDA' = 'MONTH') =>
    `https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=${calendarTz}` +
    `&mode=${mode}&showTitle=0&showPrint=0&showCalendars=0`,
  /** Adds the calendar to the visitor's own Google Calendar. */
  googleUrl: `https://calendar.google.com/calendar/render?cid=${calendarId}`,
  /** The iCal feed, for pasting into any calendar app. */
  icalUrl: `https://${icalPath}`,
  /** The same feed as a subscription link (Apple Calendar, Outlook). */
  webcalUrl: `webcal://${icalPath}`,
} as const;

/**
 * Build provenance shown in the footer and the colophon. Vercel injects
 * these; locally they fall back to a dev marker rather than a fabricated
 * hash.
 */
export function buildInfo() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? null;
  const ref = process.env.VERCEL_GIT_COMMIT_REF ?? process.env.GITHUB_REF_NAME ?? 'main';

  return {
    ref,
    sha: sha ? sha.slice(0, 6) : null,
    shaFull: sha,
    /** ISO date of this build. */
    date: new Date().toISOString().slice(0, 10),
    commitUrl: sha ? `${SITE.repoUrl}/commit/${sha}` : SITE.repoUrl,
  };
}
