/**
 * Every link that leaves the site opens in a new tab.
 *
 * Applied to the finished HTML of each page (see src/middleware.ts), so
 * it covers components, Markdown and MDX content, and links an editor
 * adds later, without each one having to remember.
 *
 * A link counts as leaving when its href is http(s) or protocol-relative
 * and points at another host. mailto:, tel:, webcal: and relative links
 * hand off to an app or stay on the site, so they are left alone.
 *
 * Each link it changes also gets "(opens in a new tab)" for screen
 * readers: appended to its aria-label if it has one, otherwise as a
 * visually hidden span. Links that already set a target are left exactly
 * as written.
 */

const NOTICE = '(opens in a new tab)';

/**
 * Script and style blocks are matched only so they can be skipped. An
 * anchor is matched whole, from its opening tag to the first </a> after
 * it; anchors cannot nest, so that is always its own closing tag.
 * Quoted attribute values may contain ">".
 */
const PATTERN =
  /<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<a\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/a>/gi;

function attr(attrs: string, name: string): string | undefined {
  const match = attrs.match(
    new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i')
  );
  return match ? (match[1] ?? match[2] ?? match[3]) : undefined;
}

function hasAttr(attrs: string, name: string): boolean {
  return new RegExp(`\\s${name}(?=[\\s=]|$)`, 'i').test(attrs);
}

function setAttr(attrs: string, name: string, value: string): string {
  const existing = new RegExp(`(\\s${name}\\s*=\\s*)(?:"[^"]*"|'[^']*'|[^\\s"'>]+)`, 'i');
  return existing.test(attrs)
    ? attrs.replace(existing, `$1"${value}"`)
    : `${attrs} ${name}="${value}"`;
}

const bareHost = (host: string) => host.toLowerCase().replace(/^www\./, '');

function leavesSite(href: string, ownHosts: Set<string>): boolean {
  if (!/^(?:https?:)?\/\//i.test(href)) return false;
  try {
    return !ownHosts.has(bareHost(new URL(href.replace(/&amp;/g, '&'), 'https://x').host));
  } catch {
    return false;
  }
}

/**
 * @param hosts This site's own hosts (e.g. "esra.bot"). A leading "www."
 *   is ignored on both sides.
 */
export function openExternalLinksInNewTab(html: string, hosts: string[]): string {
  const ownHosts = new Set(hosts.map(bareHost));

  return html.replace(PATTERN, (whole, attrs: string | undefined, content: string) => {
    if (attrs === undefined) return whole; // a script or style block

    const href = attr(attrs, 'href');
    if (!href || hasAttr(attrs, 'target') || !leavesSite(href, ownHosts)) return whole;

    let next = setAttr(attrs, 'target', '_blank');

    const rel = attr(attrs, 'rel');
    if (!rel) next = setAttr(next, 'rel', 'noopener');
    else if (!/\bnoopener\b/i.test(rel)) next = setAttr(next, 'rel', `${rel} noopener`);

    // aria-label replaces the link's text as its accessible name, so a
    // hidden span inside would never be read; extend the label instead.
    const label = attr(attrs, 'aria-label');
    if (label !== undefined) {
      next = setAttr(next, 'aria-label', `${label} ${NOTICE}`);
      return `<a${next}>${content}</a>`;
    }
    if (hasAttr(attrs, 'aria-labelledby')) return `<a${next}>${content}</a>`;

    return `<a${next}>${content}<span class="sr-only"> ${NOTICE}</span></a>`;
  });
}
