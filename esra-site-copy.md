# ESRA website copy: all pages

Draft 1 · November 13, 2026 · built from the content map doc

Ready-to-paste copy, page by page and section by section. Each section names the file it goes into, where there is one.

- `[CONFIRM: …]` marks a fact the sources disagree on. Publish the fallback wording given, or replace it once the fact is settled.
- Members is on hold and not included.
- Nothing here comes from the internal files (University FAQ, Call Plan), except where a public source says the same thing.

---

## 1. Home (`/`)

### Hero

**Eyebrow:** Experimental Student Robotics Association

**Headline:** One robot. *Many campuses.*

**Lede:** ESRA is a national nonprofit that connects university robotics teams, so they can share what they learn, split the engineering, and build robots no single campus could build alone.

**Buttons:** Get involved → `/#join` · Meet H1 → `/#h1`

**Facts row:** Partners · Schools · Robots on the roadmap · Since ICRA 2025 · 501(c)(3) nonprofit (add the last one; keep the other four)

### Why ESRA (`#why`)

**Eyebrow:** Why ESRA

**Headline:** Every campus is debugging the same robot *alone.*

**Body:**

> Today, one team spends a semester working out joint control while another works through the same problem, with little chance to compare notes.
>
> In ESRA, teams share designs, code, test methods and lessons learned. Each team starts from what the others have already worked out, instead of repeating it or its mistakes. ESRA connects student robotics clubs with each other, and with research labs, engineers and companies.

**Example aside (label: For example):**

> On H1, the leg team needs its actuators' dimensions and torque. The controller team needs to know how those joints move and what the sensors report. A joint build makes those handoffs explicit.

### Why the model works (new, under Why ESRA)

| Title | Line |
| --- | --- |
| Combine skills | Students contribute across mechanical, electrical, software and controls work. |
| Learn on real systems | Teams work through design decisions, physical testing, integration and iteration. |
| Stop repeating work | Shared code, drawings, test methods and documentation let teams build on each other. |
| Support goes further | One mentor or one piece of shared equipment helps many teams at once. |

### Who does what (new: a diagram with four boxes)

| Role | Line |
| --- | --- |
| University teams | Design, build, program, test and document the robots. |
| Research labs and engineers | Mentor teams, review designs and advise on hard problems. |
| Companies | Supply funding, hardware, software, machining and technical support. |
| ESRA | Coordinates the teams, connects support, and keeps knowledge across student cohorts. |

**Caption:** Teams stay responsible for their own work, and facilities stay with their universities.

### How a joint build works (`steps` in `index.astro`)

| # | Step | Line | Output chip |
| --- | --- | --- | --- |
| 01 | Define the project | Teams agree on the goal, the scope and the resources it needs. | Project scope |
| 02 | Split the work | Each team takes a subsystem, and the interfaces between them are agreed up front. | Owners + interfaces |
| 03 | Build at home | Each team develops and tests its part at its own university, with mentors' feedback. | Tested subsystems |
| 04 | Integrate together | Teams meet in person to assemble the robot, test it, and trace faults across mechanical, electrical and software boundaries. | One working robot |
| 05 | Document it | Designs, code, test results and lessons are published so others can build on them. | Open releases |

*(The current three steps can stay if five is too many: drop 01 and 05.)*

### H1 flagship (`#h1`, from `programs.yaml`)

**Designation:** H1

**Summary:** A full-scale humanoid, built across *campuses.*

**Description:** H1 brings mechanical structures, actuators, electronics, sensing and control software together in one robot, designed, built and tested by teams at different universities.

**Subsystem chips:** Mechanical · Actuation · Electronics · Embedded software · Controls · Perception · Simulation

**Spec card:**

| Field | Value |
| --- | --- |
| Status | In progress |
| Type | Humanoid, full-scale |
| Launched | October 2026 |
| Target | `[CONFIRM: May–Jun or Jul 2027]` Fallback: Mid-2027 |
| Outputs | Technical papers and reports, engineering videos, progress reports, open-source code and build guides |
| Licence | MIT + CERN-OHL-S |

### H1 schedule (`milestones` in `programs.yaml`)

| when | title | body |
| --- | --- | --- |
| Oct–Nov 2026 | Launch and baseline | Teams split the work and agree a shared technical baseline. |
| Winter 2026–27 | Subsystem development | Each team builds and tests its subsystem at home. Online winter workshop. `[CONFIRM: December or Jan 3–10]` |
| `[CONFIRM: Feb or Apr 2027]` Fallback: Early 2027 | First integration session | Two weeks in person: assemble the full robot, tune it, test it, collect data. |
| `[CONFIRM: May or Jul 2027]` Fallback: Mid-2027 | H1 complete | Final integration session, demonstrations, and the open release. |

### Also on the roadmap

| Card | Kind · level | Line | Status |
| --- | --- | --- | --- |
| Q1 quadruped | Quadruped · Legged | A four-legged robot that builds on ESRA's Q0 prototype, developed by a separate group of universities. | Planned, from Feb 2027 |
| Teleoperation arm | Manipulator · Beginner | A robot arm driven by a human operator: the starting project for new members, guided by senior members. | Planned, Feb–Apr 2027 |
| Precision manipulator | Manipulator · Advanced | A high-payload arm that keeps high precision. Open to partners. | Planned, from May 2027 |

### Get involved (`#join`)

**Eyebrow:** Get involved

**Headline:** Four ways in. Start where you *fit.*

**Lede:** Whether you are a student, a club, a lab or a company, there is a place for you. Open a card to see what each involves.

*(Card copy is in section 4.)*

**Note under the cards:** Not sure which fits? Email info@esra.bot and we will point you the right way.

### Partners

No new copy. Add a school to `partners.yaml` only once it has signed the Partnership MOU.

---

## 2. Projects (`/projects`)

### Hero

**Eyebrow:** Projects

**Headline:** Real robots, built *in the open.*

**Lede:** Humanoids, quadrupeds and manipulators, built by student teams across universities and documented well enough for others to rebuild.

### Project areas (new, top of page)

| Area | What it covers |
| --- | --- |
| Humanoids | Mechanical systems, balance, whole-body control, perception, computing, power, integration |
| Quadrupeds | Legged robotics, actuator control, gait development, state estimation, locomotion |
| Manipulators | Robot arms, end effectors, calibration, force-aware control, manipulation |
| Enabling systems | Custom electronics, embedded systems, software, simulation, test rigs, tooling |

### Roadmap (`#roadmap`)

Use the H1 and Also-on-the-roadmap copy from Home. Add a timeframe to each card in `programs.yaml`:

| id | timeframe |
| --- | --- |
| h1 | Oct 2026 – `[CONFIRM]` Fallback: mid-2027 |
| q1 | From Feb 2027 |
| teleoperation-arm | Feb – Apr 2027 |
| precision-manipulation | From May 2027 |

**Rename** `precision-manipulation` → title "Precision manipulator", summary as on Home.

### Inside H1 (new section after the roadmap, `#inside-h1`)

**How it's built**

1. Each university develops its assigned subsystems against a shared technical baseline.
2. Parts travel between universities, and engineers visit other teams for hands-on work.
3. Everything comes together at two-week, in-person integration sessions.
4. Every session is recorded: telemetry, configurations, calibration changes, test conditions and video.

**Inside an integration session**

| Days | What happens | What it produces |
| --- | --- | --- |
| 1–2 | Assemble the robot, calibrate sensors and joints | A calibrated system and baseline data |
| 3–5 | Tune control on the real hardware | Controller settings and measured response |
| 6–7 | Trace and fix failures across subsystems | Failure analysis and before-and-after tests |
| 8–10 | Run agreed experiments; compare with simulation | Datasets and simulation comparisons |
| 11–12 | Repeat trials for reliability and heat | Repeatability and reliability data |
| 13–14 | Confirm the best setups | Validated configurations and curated datasets |

### Open documentation (new, `#open-documentation`)

**Eyebrow:** Open source

**Headline:** Engineering others can *rebuild.*

**Lede:** Every project is published on GitHub, so other student teams can understand the design decisions, reproduce the work and build on it.

**Each release includes:** CAD files · Bills of materials · Electronics docs · Source code · Setup instructions · Calibration procedures · Test resources · Versioned releases

**Reports:** `[CONFIRM: papers vs reports]` Fallback: "Technical papers and reports document design decisions, methods, results and limitations. The final H1 report is a full build guide."

### Industry Research Alliance (new aside)

**Label:** Coming soon

**Title:** Industry Research Alliance

**Body:** A company brings a research question. Research labs carry out the work, with qualified ESRA students involved from the start. Separate from H1 and its public releases.

### Builds, written up · Repositories

No changes.

---

## 3. Events (`/events`)

### Featured events (`events.yaml`)

`tentative: true` is a new field (see the brief): the card shows the `when` text and a "Date to be confirmed" chip instead of the big month. `start` is then only used for sorting, and is set to the later of the two candidate dates so a card never shows "Happening now" too early.

```yaml
- id: h1-hardware-kickoff
  # keep, but change the third highlight from "May–June 2027" to:
  #   'The target: a complete full-scale humanoid by mid-2027'

- id: winter-workshop
  title: Winter workshop
  kicker: Online · with a research lab or company
  when: Winter 2026–27   # [CONFIRM: December 2026 or Jan 3–10, 2027]
  start: 2027-01-03
  tentative: true
  format: Online workshop
  location: Online
  summary: >-
    A hands-on session on choosing and integrating actuators:
    selection, communications, power, bench testing and
    performance evaluation.
  highlights:
    - A practical exercise and technical notes for every participant
    - Helps every H1 team test components the same way
    - Run with a research lab or company (to be announced)

- id: h1-integration-1
  title: H1 integration session
  kicker: H1 humanoid · In person
  when: Early 2027   # [CONFIRM: February or early April 2027]
  start: 2027-04-01
  tentative: true
  format: Two-week build session
  location: To be announced
  summary: >-
    Every team brings its hardware. Two weeks to assemble the
    full robot, tune it, test it and collect data.

- id: esra-event-2027
  title: ESRA event
  kicker: Keynotes · Competitions · Demos
  when: March 2027
  start: 2027-03-01
  end: 2027-03-31
  format: Conference and competition
  location: To be announced
  summary: >-
    Keynotes from research labs, technical competitions, live
    demos, and time for students to meet companies.
  highlights:
    - Competitions in teleoperation, perception, control and manipulation
    - Student teams, research labs and companies in one place
    - Speakers and partners to be announced

- id: h1-integration-2
  title: H1 final integration session
  kicker: H1 humanoid · In person
  when: Mid-2027   # [CONFIRM: May or July 2027]
  start: 2027-07-01
  tentative: true
  format: Build session and demos
  location: To be announced
  summary: >-
    Endurance and reliability trials, final demonstrations and
    benchmark datasets: the session that completes H1.
```

*(The summer ESRA event, July–Aug 2027, appears only in the industry deck. Add it once confirmed.)*

### What we publish (new strip under the calendar)

| Output | How often |
| --- | --- |
| Newsletter | Twice a week |
| Researcher and engineer blog | Monthly |
| Progress posts | Twice a month |
| Progress reports | December, March and at H1's completion |

---

## 4. Get involved: the four pop-up cards (`pathways.yaml`)

Order: Students, Clubs, Labs, Companies. Each pop-up runs: what you do → what you get → how to start.

### Card 1: Students

**Card face**

- **Audience:** Students
- **Title:** Join the team
- **Lede:** Help build the robots, or the organisation behind them.
- **Points:** Own a real part of a working robot · Work with students from other universities · Leave with work you can show in interviews

**Pop-up**

**Intro:** ESRA is run by students. Engineers and programmers build the robots. Business and marketing students build the partnerships, funding and stories that keep the projects going.

**Where you could work**

| Track | Areas | Email |
| --- | --- | --- |
| Engineering | Mechanical design and CAD, actuators, electronics and power, fabrication and testing, system integration | engineering@esra.bot |
| Computer science | Robotics and embedded software, controls, perception, simulation, data and test tools | engineering@esra.bot |
| Business and marketing | Partnerships, marketing and communications, finance, events and operations, strategy and growth | marketing@esra.bot `[CONFIRM: mailbox exists]` |

**What you get**

- Responsibility for a real subsystem, software component, campaign or proposal
- Design reviews and problem-solving with students from other schools
- CAD, code, test results, proposals or campaigns to show employers

**How to start:** Email us and tell us which part of ESRA you want to own.

**Button:** Email engineering@esra.bot · secondary: Email marketing@esra.bot

### Card 2: University clubs

**Card face**

- **Audience:** University clubs
- **Title:** Partner club
- **Lede:** Build part of a robot no single campus could build alone.
- **Points:** Own a subsystem on a shared robot · Build and test at your own university · Share designs, code and events across the network

**Pop-up**

**Intro:** Partner clubs build. Teams agree on what the robot should do, split the engineering, and agree how the parts fit together. Then each club owns its part.

**Ways to take part** `[CONFIRM: does the affiliate tier still exist?]`

| Role | Fits |
| --- | --- |
| Lead a subsystem | A club that can own a whole part, like the legs or a hand |
| Contribute to a project | A club helping on a project without leading a part |
| Affiliate | Newer clubs, or schools too far to travel to integration sessions |

**What your club gets**

- Events, workshops and design reviews across the network
- Shared designs, code and documentation
- A starter kit for hosting ESRA events
- Spotlights on the ESRA site and socials
- Introductions to sponsors and mentors
- A vote on the Leadership Council `[CONFIRM: after the bylaws are adopted]` Fallback: leave this line out

**What we ask**

- A rep and a backup who reply within 7 days
- One ESRA activity a semester
- One hosted or co-hosted event a year

**Good to know:** Your club signs, not your university. It's a good-faith agreement, not a contract, and you can leave with 30 days' notice. You keep your name, members, robot and designs.

**How to start:** Email us your club, your school, and what your team builds.

**Button:** Join as a club → `mailto:info@esra.bot?subject=Partner club`

### Card 3: Research labs

**Card face**

- **Audience:** Research labs
- **Title:** Partner lab
- **Lede:** Mentor student teams and meet motivated students.
- **Points:** Review designs and advise on research · Speak, teach or judge at ESRA events · Share tools, data and research openings

**Pop-up**

**Intro:** Labs bring research experience to student teams. Students stay responsible for the engineering; labs help them frame problems, test well and learn from current research.

**What your lab could do**

- Review designs and test plans
- Advise on papers and research questions
- Give talks, lead workshops, judge challenges
- Share open-source tools, datasets or test time
- Post undergraduate research openings

**What we ask**

| Commitment | Amount |
| --- | --- |
| Mentor a project team | 1 team, about 4 hours a month |
| Speak or exhibit at ESRA events | 2 a year |

**What your lab gets**

- ESRA handles event logistics
- A named student lead for each team you mentor
- Introductions to industry partners
- Your papers and news shared on ESRA channels
- Letters of collaboration for grant proposals

**Good to know:** Labs advise and don't build. Your research, equipment and members stay entirely yours.

**How to start:** Email us your lab and research areas.

**Button:** Become a partner lab → `mailto:partnerships@esra.bot?subject=Partner lab` `[CONFIRM: mailbox exists; else info@]`

### Card 4: Companies

**Card face**

- **Audience:** Companies
- **Title:** Industry partner
- **Lede:** Put your platform in student hands across many campuses.
- **Points:** Fund a project or supply what you make · One contribution reaches many universities · Recognition on the robots you support

**Pop-up**

**Intro:** Companies give ESRA's projects the resources to build real systems. In return, your product is used, tested and documented by students who carry it into labs, startups and industry.

**Why sponsor**

- Students learn on your platform and take it with them
- One contribution reaches teams at many universities
- Projects produce documentation other teams reuse

**Two ways to give**

| Route | What it is |
| --- | --- |
| Direct funding | Cash for one project or for shared resources |
| Project package | Hardware, machining, software or compute built around what you make |

**Partnership levels**

| Level | Value | What it unlocks | What you get |
| --- | --- | --- | --- |
| Bronze | Under $2,500 | Your platform as the reference for ROS 2, controls or perception work | Recognition on the robot, esra.bot and the repo |
| Silver | $2,500–$7,500 | A new ESRA subsystem: a leg module, arm or perception stack | Bronze, plus featured branding, regular content and student access |
| Gold | $7,500–$12,500 | A flagship project, from architecture to tested hardware | Silver, plus prominent branding and a co-branded case study |
| Platinum | $12,500+ | A programme across several robots | Gold, plus priority recognition, a partnership announcement and year-round coverage |

Levels go by the agreed practical value of a contribution, not list price.

**Where your support is seen:** On the robot · esra.bot and GitHub · Build updates and videos · Events and trade-show booths · Talks with the students

**How it starts**

1. Intro call
2. Scope the package and level
3. Confirm in writing
4. Teams build and report back

**Good to know:** Recognition is neutral, with no endorsements. Support gives no control over projects. ESRA is a 501(c)(3), so donations are tax-deductible.

**Coming soon:** The Industry Research Alliance, where a company brings a research question and labs and students take it on together.

**Button:** Start a conversation → `mailto:partnerships@esra.bot?subject=Industry partnership` `[CONFIRM: mailbox exists; else info@]`

---

## 5. Contact (`/contact`, `CONTACTS` in `src/data/site.ts`)

| address | label | note |
| --- | --- | --- |
| info@esra.bot | General | Introductions, press, and anything that has no better home. |
| engineering@esra.bot | Engineering | Hardware, software, the open designs, and project timelines. Students who want to build start here. |
| partnerships@esra.bot | Partnerships | Companies and research labs: sponsorship, mentoring and joint research. `[CONFIRM: mailbox exists in Zoho]` |
| marketing@esra.bot | Marketing | Business and marketing students who want to join, and media. `[CONFIRM: mailbox exists in Zoho]` |

**Remove** `vibhu@esra.bot` (a personal address). Also remove `ccbrrobotics@gmail.com` from `src/data/orgs.ts`.

---

## 6. Sitewide

- `src/data/site.ts`: `incorporated` → `[CONFIRM: May 28 or June 2026]` Fallback: "New Jersey nonprofit, 2026"
- Add "501(c)(3)" to the footer line beside the incorporation.
- Search index (`src/lib/search-index.ts`): change "Three ways in: member team, affiliate club, industry and research" to "Four ways in: students, partner clubs, labs and companies".
