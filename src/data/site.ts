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
  /** Legal status, from the incorporation record. */
  incorporated: 'New Jersey nonprofit, June 2026',
  license: 'MIT + CERN-OHL-S',
  repo: 'esrabot/web',
  repoUrl: 'https://github.com/esrabot/web',
  orgUrl: 'https://github.com/esrabot',
} as const;

/**
 * Contact addresses.
 *
 * These are real, monitored mailboxes on Zoho Mail (free plan for now).
 * They are the only email addresses that should appear anywhere on the
 * site — do not invent role addresses that no one is reading. Adding a new
 * mailbox is a one-line edit here once it exists in Zoho.
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
    note: 'Hardware, firmware, and questions about the open designs.',
  },
  {
    address: 'vibhu@esra.bot',
    label: 'Vibhu T. Gooty',
    note: 'Co-director. Partnerships and anything organisational.',
  },
];

/**
 * Primary navigation, in the order it reads across the header. Search and
 * the "Get involved" button sit after it and are not part of this list.
 */
export const NAV: { label: string; href: string }[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'Events', href: '/events' },
  { label: 'Guides', href: '/docs' },
  { label: 'Members', href: '/members' },
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
