/**
 * The organisation and link registry.
 *
 * This is the ONLY place ESRA's own channel URLs are written down. The
 * header, footer, contact page and structured data all read from here —
 * so adding a social account is a one-line edit that lights it up
 * everywhere.
 *
 * ESRA currently has LinkedIn, YouTube and GitHub only; its email
 * addresses live in CONTACTS in data/site.ts. Absent platforms are simply
 * omitted rather than rendered as dead icons. Do not add a URL here that
 * has not been confirmed to exist.
 */

/** Platforms we know how to render an icon and label for. */
export type Platform =
  | 'website'
  | 'github'
  | 'linkedin'
  | 'youtube'
  | 'instagram'
  | 'x'
  | 'bluesky'
  | 'email'
  | 'linktree';

export interface SocialLink {
  platform: Platform;
  /** Display handle, e.g. "@CCBRRobotics". Falls back to the host. */
  handle?: string;
  url: string;
}

export interface Org {
  id: string;
  /** Short name used in UI chrome. */
  name: string;
  /** Expanded name for first mention and structured data. */
  fullName: string;
  /** One line, used in footers and meta descriptions. */
  blurb?: string;
  /** Former name, surfaced where the rebrand needs explaining. */
  formerly?: string;
  links: SocialLink[];
  /**
   * YouTube handle, used to resolve a channel ID for the video feed.
   * Kept separate from `links` because the feed pipeline needs it
   * independently of presentation.
   */
  youtubeHandle?: string;
}

export const ESRA: Org = {
  id: 'esra',
  name: 'ESRA',
  fullName: 'Experimental Student Robotics Association',
  blurb:
    'A national nonprofit connecting university robotics teams to build humanoids, quadrupeds, and manipulators together — in the open.',
  formerly: 'CCBR',
  youtubeHandle: 'CCBRRobotics',
  links: [
    { platform: 'website', handle: 'esra.bot', url: 'https://esra.bot' },
    { platform: 'github', handle: 'esrabot', url: 'https://github.com/esrabot' },
    {
      platform: 'linkedin',
      handle: 'ccbr-robotics',
      url: 'https://www.linkedin.com/company/ccbr-robotics/',
    },
    {
      platform: 'youtube',
      handle: '@CCBRRobotics',
      url: 'https://www.youtube.com/@CCBRRobotics',
    },
  ],
};

/**
 * Every org whose content feeds the site. Order is presentation order.
 * Partner clubs are not orgs: they live in src/content/partners.yaml.
 */
export const ORGS: Org[] = [ESRA];

export function getOrg(id: string): Org | undefined {
  return ORGS.find((o) => o.id === id);
}

/** Channels the video feed pulls from. */
export const YOUTUBE_SOURCES = ORGS.filter((o) => o.youtubeHandle).map((o) => ({
  orgId: o.id,
  orgName: o.name,
  handle: o.youtubeHandle as string,
}));

/**
 * Human-readable platform labels. Icon names map to the `simple-icons`
 * and `lucide` sets declared in astro.config.mjs.
 */
export const PLATFORM_META: Record<Platform, { label: string; icon: string; short: string }> = {
  website: { label: 'Website', icon: 'lucide:globe', short: 'web' },
  github: { label: 'GitHub', icon: 'simple-icons:github', short: 'gh' },
  linkedin: { label: 'LinkedIn', icon: 'simple-icons:linkedin', short: 'in' },
  youtube: { label: 'YouTube', icon: 'simple-icons:youtube', short: 'yt' },
  instagram: { label: 'Instagram', icon: 'simple-icons:instagram', short: 'ig' },
  x: { label: 'X', icon: 'simple-icons:x', short: 'x' },
  bluesky: { label: 'Bluesky', icon: 'simple-icons:bluesky', short: 'bs' },
  email: { label: 'Email', icon: 'lucide:mail', short: '@' },
  linktree: { label: 'Linktree', icon: 'lucide:external-link', short: 'lt' },
};
