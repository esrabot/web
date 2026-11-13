# esrabot/web

The ESRA website — [esra.bot](https://esra.bot).

Built in the open, like everything else here. If you want to change what
the site _says_, you almost certainly want
**[CONTRIBUTING.md](./CONTRIBUTING.md)** rather than this file.

---

## What this is

A statically generated [Astro](https://astro.build) site. Every page is
prerendered to HTML at build time and served from a CDN — there is no
server rendering, no database, and no client-side data fetching.

External data (repository statistics, video listings) is fetched **during
the build** and baked into the HTML. A scheduled job rebuilds the site so
that data stays current without anyone running a build by hand.

```
push to main   ─┐
cron, 6h       ─┼─→ GitHub Action ─→ astro build ─→ Vercel
org repo push  ─┘         │
                          ├─ GitHub API      (repos, stars, commits)
                          ├─ YouTube feed    (ESRA's channel)
                          └─ src/content/    (markdown, YAML)
```

Publishing content does not wait for the cron: committing markdown to
`main` triggers a deploy immediately.

---

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

| Command                 | What it does                                             |
| ----------------------- | -------------------------------------------------------- |
| `pnpm dev`              | Development server                                       |
| `pnpm build`            | Production build into `dist/`                            |
| `pnpm preview`          | Serve the built site locally                             |
| `pnpm validate:content` | Check content files, in plain English                    |
| `pnpm validate:links`   | Check every internal link resolves (needs a build first) |
| `pnpm check:contrast`   | Verify colour contrast meets WCAG AA                     |
| `pnpm typecheck`        | Type and template checking                               |
| `pnpm optimize:assets`  | Re-compress images in `src/assets/`                      |

---

## Layout

```
src/
  content/          ← the site's actual content
    members/          one file per person
    projects/         curated project pages
    docs/             field guides
    boms/             bills of materials
    partners.yaml     partner clubs and schools
    programs.yaml     the roadmap: H1, Q1 and the manipulator projects
    events.yaml       featured events on /events
    pathways.yaml     the "Get involved" cards and their pop-ups
    featured.yaml     hand-picked links for the home page
  data/
    orgs.ts           every social/org URL, defined once
    site.ts           site constants, navigation, the events calendar
  components/
    ui/               design-system primitives
    blog/             the MDX authoring vocabulary (guides, projects)
    search/           the search box, dialog and page
  lib/
    github.ts         repo data, cached, degrades gracefully
    youtube.ts        channel feeds
    search-index.ts   builds /search-index.json from the collections
  scripts/
    search.ts         search in the browser (no service behind it)
  styles/
    tokens.css        every colour, size, and spacing value
  pages/            ← routes
scripts/            ← validation and asset tooling
```

### Two rules worth keeping

**Content lives in `src/content/`, never in a component.** If you find
yourself typing a person's name or a repo's star count into a `.astro`
file, it belongs in content or comes from an API instead.

**Design values live in `src/styles/tokens.css`, never inline.** There
should be no raw hex codes or pixel spacing anywhere else. The token file
documents the measured contrast ratio of every text colour, and
`pnpm check:contrast` fails the build if a change drops below WCAG AA.

---

## Design system

A light, warm page: warm white and beige surfaces, deep navy ink, and a
single blue for everything you can act on. Headlines are set in
[Fraunces](https://fonts.google.com/specimen/Fraunces), a soft serif, with
one italic word in blue; running text and the interface are in
[Inter](https://rsms.me/inter/); code and table figures in IBM Plex Mono.
All three are open-licence and self-hosted.

Everything lives as tokens in [tokens.css](./src/styles/tokens.css) —
colours, type sizes, spacing, radii, shadows and motion — and the shared
pieces (buttons, cards, chips, pop-up dialogs, scroll arrivals) are defined
once in [global.css](./src/styles/global.css).

- **Motion.** Blocks rise into view once, cards lift under the pointer,
  buttons sink when pressed, dialogs ease open, and pages cross-fade where
  the browser supports it. All of it stands down under
  `prefers-reduced-motion`, and nothing depends on it: without JavaScript
  every block is simply visible.
- **Contrast.** `pnpm check:contrast` measures every text-and-surface pair
  in the tokens against WCAG AA and fails CI below it.
- **Partner logos** are redrawn in the page's own ink at build time
  ([logo-mark.ts](./src/lib/logo-mark.ts)), so none of them clash.

### Where to change what

| To change…                                    | Edit                                          |
| --------------------------------------------- | --------------------------------------------- |
| The robots on the roadmap, and H1's dates     | `src/content/programs.yaml`                   |
| Featured events                               | `src/content/events.yaml`                     |
| Everyday dates                                | the public Google Calendar — no deploy needed |
| The "Get involved" cards and their pop-ups    | `src/content/pathways.yaml`                   |
| The navigation, or which calendar is embedded | `src/data/site.ts`                            |
| How many repositories show before "Show all"  | `REPO_PAGE` in `src/pages/projects.astro`     |

The four YAML files can also be edited in the content editor at `/admin`.

---

## Deployment

Hosted on Vercel via the Git integration — every push builds, and every
pull request gets a preview URL.

Configuration lives in [`vercel.json`](./vercel.json). Secrets needed:

| Secret               | Where               | Why                                       |
| -------------------- | ------------------- | ----------------------------------------- |
| `VERCEL_DEPLOY_HOOK` | GitHub repo secret  | Lets the scheduled job trigger a rebuild  |
| `GITHUB_TOKEN`       | provided by Actions | Authenticated API rate limit during build |

The site degrades rather than fails when these are absent: no deploy hook
means no scheduled refresh.

---

## Licence

Site code MIT. Written content and photographs belong to their authors,
credited in each file.
