# Brief for Claude Code: put the new copy on the ESRA site

Paste this to Claude Code from the repo root, with `esra-site-copy.md` next to it:

> Read `esra-site-update-brief.md` and follow it. The copy to use is in `esra-site-copy.md`.

---

## What this task is

Update the ESRA site (`esrabot/web`, Astro 7) so every page carries the copy in `esra-site-copy.md`. Then sweep the rest of the site so nothing else contradicts it or the source documents in `sourcematerial/`.

The copy came from a content map built from those documents. Where two sources disagree, the copy marks the fact `[CONFIRM: …]` and gives fallback wording. **Publish the fallback wording, never the bracket.** Leave a `// TODO(confirm): …` (or `# TODO(confirm): …` in YAML) beside each fallback so it can be found later with `grep -rn "TODO(confirm)" src`.

## Standing rules (from HANDOFF.md)

- **Do not run `git commit` or `git push`.** The user commits.
- No co-author or tool attribution lines anywhere.
- Leave `context.txt` alone.
- Don't publish anything from `sourcematerial/ESRA University FAQ.docx` or `ESRA University Call Plan.docx` that isn't also in a public source. That rules out sponsor names "in talks", fundraising figures, school-by-school status, and the NYC venue.
- Don't add partners to `partners.yaml`.
- Leave the Members page alone (on hold).
- Keep the current design system: tokens in `src/styles/tokens.css`, existing card, chip, `SectionHead` and `Section` components, `data-reveal` motion. New sections should look like they were always there.

## Environment (Windows)

- Use `pnpm.cmd` / `npm.cmd` in PowerShell.
- After changing `src/content.config.ts`, restart the dev server: `pnpm astro dev stop`, then start it again. It keeps serving the old schema otherwise.
- `pnpm validate:content` fails on Windows only (CRLF paths). Don't chase it.
- For formatting, use `npx prettier --check --end-of-line auto "**/*.{astro,ts,js,mjs,json,md,mdx,css,yaml,yml}"`.
- Playwright: launch with `channel: 'msedge'`.

---

## 1. Schema and CMS changes (do these first)

### `src/content.config.ts`

**pathways**

- `icon`: change the enum to `['student', 'club', 'lab', 'company']`.
- `sections[]`: each section keeps `heading` and gains exactly one of:
  - `items: string[]` (as now), or
  - `table: { columns: string[], rows: { cells: string[] }[] }`, or
  - `text: string` (a short paragraph).

  Make `items` optional and validate that a section has one of the three.
- Add optional `email` (the button's address; defaults to `CONTACTS[0].address`).
- Add optional `secondary: { label, email, subject }` (a second button; the Students card uses it).
- Allow up to two notes: rename `note` → `notes: { label, body }[]` (default `[]`). Clubs and Labs use one ("Good to know"); Companies uses two ("Good to know", "Coming soon").

**events**

- Add `tentative: z.boolean().default(false)`.

### `public/admin/config.yml`

Mirror every schema change, so `/admin` can edit everything:

- pathways `icon` options;
- section `table` (columns list, rows list of `cells` lists) and `text`;
- `email`, `secondary`, `notes`;
- events `tentative`, with the hint "Date not final: the card shows the 'When' text instead of the month".

### `astro.config.mjs`

Add `'flask-conical'` to the lucide `include` list, for the Labs card. `graduation-cap`, `users` and `building-2` are already there.

---

## 2. Content files

### `src/content/pathways.yaml`

Replace the three entries with four, in this order (`order: 1`–`4`):

| id | icon | Copy section |
| --- | --- | --- |
| `students` | `student` | Card 1: Students |
| `partner-club` | `club` | Card 2: University clubs |
| `partner-lab` | `lab` | Card 3: Research labs |
| `industry-partner` | `company` | Card 4: Companies |

Each card face uses the copy's **Audience / Title / Lede / Points**, and each pop-up uses its **Intro**. The headed blocks map onto `sections` as lists, tables or text, matching the copy's shape (the Partnership levels table must be a `table`). The **Good to know** and **Coming soon** lines become `notes`, and **How to start** becomes `start`. The **Button** gives `cta`, `subject` and `email`.

- Students: `email: engineering@esra.bot`, plus `secondary` for `marketing@esra.bot`.
- Labs and Companies: `email: partnerships@esra.bot`.
- Clubs: `info@esra.bot` (the default).
- Keep the header comment, updated for the new fields.

### `src/content/programs.yaml`

Apply the copy's Home → H1 flagship, H1 schedule, Also on the roadmap, and Projects → Roadmap timeframes.

- H1 `focus` becomes the seven chips in the copy.
- H1 `outputs`: "Technical papers and reports", "Engineering videos", "Progress reports", "Open-source code and build guides".
- H1 `timeframe`: `Oct 2026 – mid-2027` (TODO confirm).
- `precision-manipulation`: keep the id; change the title to "Precision manipulator" and use the copy's summary.
- H1 milestones (`starts` / `when`):

| starts | when | title |
| --- | --- | --- |
| 2026-10-15 | Oct–Nov 2026 | Launch and baseline |
| 2026-11-11 | Winter 2026–27 | Subsystem development |
| 2027-04-01 | Early 2027 | First integration session |
| 2027-07-01 | Mid-2027 | H1 complete |

The last two are TODO confirm. Their `starts` use the later candidate date, so the "Now" marker doesn't move ahead of reality.

### `src/content/events.yaml`

Use the YAML in the copy's Events section as written, including the change to `h1-hardware-kickoff`'s third highlight ("by mid-2027"). Only the H1 kickoff stays `featured: true`; the rest go in "More events".

---

## 3. Pages and components

### Home (`src/pages/index.astro`)

- **Hero facts:** add a fifth fact, "501(c)(3)" with the label "Nonprofit status". Keep "Since ICRA 2025". Make `.hero-facts` wrap cleanly at five: `repeat(auto-fit, minmax(…))`, with two columns at ≤ 640px.
- **Why ESRA:** replace the body with the copy's two paragraphs. Keep the headline and the example aside.
- **Why the model works (new):** a four-item grid under Why ESRA. Short title, one line each.
- **Who does what (new):** a simple diagram. Three supporting roles (Research labs and engineers, Companies, ESRA) connect to University teams, with the caption underneath. Build it in HTML/CSS with the existing card styles, not an image. Stack vertically on phones.
- **How a joint build works:** five steps from the copy. The `.steps` grid needs to handle five: five columns above about 1180px, otherwise a row of three then two, or a single column. Keep the connector arrows only where steps sit side by side.
- **H1 spec card:** rename the "Hardware start" label to "Launched" and show "October 2026". Keep Status, Type, Target (from the last milestone's `when`), Outputs and Licence.
- **Get involved:**
  - headline "Four ways in. Start where you *fit.*" and the copy's lede;
  - `WAY_ICON` → `{ student: 'lucide:graduation-cap', club: 'lucide:users', lab: 'lucide:flask-conical', company: 'lucide:building-2' }`;
  - `.ways` becomes four columns on wide screens, two at ≤ 1180px, one at ≤ 640px;
  - each card's mailto uses its own `email`.
- **Pop-up rendering:**
  - Render `table` sections as a compact table: header row in the label font, hairline rules, and horizontal scroll inside the pop-up on phones (never the page).
  - Render `text` sections as a paragraph.
  - Render each `notes` entry with the existing `.wm-note` style.
  - Show the `secondary` button beside the primary one in `.wm-foot`.
  - Wide tables (Partnership levels) need the pop-up to be wider. Raise the modal max-width for this dialog only, if needed.
- Update the file's top comment ("The three 'ways in'" → four).

### Projects (`src/pages/projects.astro`)

- **Hero:** use the copy's eyebrow, headline and lede.
- **Project areas (new):** a four-item grid at the top, before the roadmap.
- **Inside H1 (new):** a section after the roadmap, with the four-step "How it's built" list and the six-row integration-session table (Days · What happens · What it produces). Link it from the H1 roadmap card (`/projects#inside-h1`).
- **Open documentation (new):** a section before Repositories. Use the copy's eyebrow, headline and lede, with the eight release contents as chips and the reports line (TODO confirm). Its "All repositories on GitHub" link can live here or stay in Repositories, but not both.
- **Industry Research Alliance:** an aside under Open documentation, labelled "Coming soon", in the `.wm-note`-like sand style.

### Events (`src/pages/events.astro`)

- **`tentative` events:**
  - In the featured card's date block and the "More events" date badge, show the `when` text instead of the month and year.
  - Add a small chip, "Date to be confirmed".
  - Never show "Happening now" or "Past" for a tentative event: treat it as upcoming.
- **What we publish (new):** a small four-item strip between "On the horizon" and the calendar (Output · How often), from the copy.

### Contact (`src/data/site.ts` → `CONTACTS`)

- Replace the list with the four addresses, labels and notes in the copy, in that order.
- Remove `vibhu@esra.bot`.
- Add `TODO(confirm)` beside `partnerships@` and `marketing@` (the Zoho mailboxes may not exist yet). Update the comment above `CONTACTS` to say so.

### `src/data/orgs.ts`

Remove the `ccbrrobotics@gmail.com` email link from `ESRA.links`. Leave the LinkedIn and YouTube channels and `formerly: 'CCBR'` as they are.

---

## 4. Consistency sweep

After the content is in, fix every remaining line that disagrees with the new copy. Known spots:

| File | Change |
| --- | --- |
| `src/data/site.ts` | `incorporated` → `'New Jersey nonprofit, 2026'` (TODO confirm: May 28 or June 2026). The footer line then reads "© 2026 Experimental Student Robotics Association · New Jersey nonprofit, 2026". Append "· 501(c)(3)" in `Footer.astro`. |
| `src/lib/search-index.ts` | Get involved entry: `d` → "Four ways in: students, partner clubs, labs and companies." Replace the old words in `w` with: students engineering computer science business marketing partner club lab research mentor company sponsor sponsorship levels bronze silver gold platinum industry research alliance. Add static entries for `/projects#inside-h1` ("Inside H1") and `/projects#open-documentation` ("Open documentation"). |
| `src/components/search/SearchDialog.astro` | Get involved hint → "Four ways in". |
| `src/pages/search.astro` | Get involved hint → "Four ways in, for students, clubs, labs and companies." |
| `src/pages/events.astro` | Hero lede: "integration workshops" → "integration sessions". |
| Anywhere | Run the search below and fix each hit to match the copy. |

```bash
grep -rniE "member team|affiliate club|three ways|May–Jun|May-June|winter integration workshop" src public
```

Then read every page once, top to bottom, against `esra-site-copy.md`. Check the dates, names and counts, the email addresses, and the project names: "Precision manipulator", "Teleoperation arm", "Q1 quadruped", "H1 humanoid".

---

## 5. Check before handing back

1. `pnpm typecheck`
2. `pnpm build`
3. `pnpm validate:links`
4. `pnpm check:contrast`
5. Prettier check (the CRLF-tolerant command above), then format any file you touched.
6. Screenshot `/`, `/projects`, `/events`, `/contact` and each of the four pop-ups, at 1440px and 390px:
   - no console errors;
   - no horizontal page scroll (tables scroll inside their pop-up);
   - the five hero facts, five steps and four cards wrap cleanly.
7. Open `/admin` locally and confirm the Get involved, Events and Roadmap editors load and show the new fields.

## 6. When done

Update `HANDOFF.md`:

- Add a dated section summarising what changed.
- List every `TODO(confirm)` with its file, and the two possible answers for each (`grep -rn "TODO(confirm)" src public`).
- Under open questions, note that the partnerships@ and marketing@ mailboxes need to exist in Zoho.

Don't commit. Tell the user the changes are ready to review.
