# Tsering Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Astro website for a student association: a home page with Instagram carousel + upcoming events + Google Form CTA, an Events section with detail pages and per-event Instagram photo grids, plus About and Contact pages. Editable via github.com web UI; deployed to Cloudflare Pages on `git push`.

**Architecture:** Astro static site, content in markdown collections, global config in `site.json`, Tailwind for utility styling. Three integrations are link-outs/embeds (Luma, Google Form, behold.so); one (Instagram per-event grids) uses Instagram's official `<blockquote>` embeds. Visual design is deliberately deferred to a follow-up phase using the `frontend-design` skill — this plan produces structurally complete, minimally-styled pages.

**Tech Stack:** Astro 5.x, Tailwind CSS, TypeScript, Zod (via Astro content collections), vitest for unit tests, pnpm, Cloudflare Pages.

**Security policy:**
- Every direct dependency is **exactly pinned** in `package.json` (no `^`, no `~`).
- `.npmrc` enforces `save-exact=true` and `save-prefix=""` so future installs stay pinned.
- `pnpm-lock.yaml` is committed; transitive deps locked.
- Only mainstream, heavily-audited libraries: `astro`, `@astrojs/tailwind`, `tailwindcss`, `vitest` (devDep), `typescript` (devDep). No exotic or low-popularity packages.
- Site config is plain JSON parsed via TypeScript's native JSON import — no YAML parser dependency.
- No analytics, no third-party JS at runtime except: behold.so widget script (home only) and Instagram `embed.js` (event detail pages only, when `instagramPosts` is non-empty). Both are loaded via `<script>` tags, not as npm deps.

**Reference spec:** `docs/superpowers/specs/2026-05-02-tsering-website-design.md`

---

## File Structure

Files created across all tasks:

```
tsering/
├── .gitignore
├── README.md                                    # Task 14
├── astro.config.mjs                             # Task 1, 13
├── package.json                                 # Task 1
├── pnpm-lock.yaml                               # Task 1
├── tailwind.config.mjs                          # Task 1
├── tsconfig.json                                # Task 1
├── vitest.config.ts                             # Task 6
├── public/
│   └── favicon.svg                              # Task 1 (kept from scaffold)
├── src/
│   ├── content/
│   │   ├── config.ts                            # Task 3
│   │   ├── events/
│   │   │   ├── 2026-06-15-spring-gala.md        # Task 4 (sample, future date)
│   │   │   └── 2026-03-10-welcome-night.md      # Task 4 (sample, past date)
│   │   └── site/
│   │       ├── home.md                          # Task 4
│   │       ├── about.md                         # Task 4
│   │       └── contact.md                       # Task 4
│   ├── data/
│   │   └── site.json                             # Task 2
│   ├── lib/
│   │   ├── siteConfig.ts                        # Task 2
│   │   ├── events.ts                            # Task 6
│   │   └── events.test.ts                       # Task 6
│   ├── layouts/
│   │   └── BaseLayout.astro                     # Task 5
│   ├── components/
│   │   ├── Hero.astro                           # Task 7
│   │   ├── EventCard.astro                      # Task 7
│   │   ├── UpcomingEvents.astro                 # Task 7
│   │   ├── JoinUsCTA.astro                      # Task 7
│   │   ├── InstagramCarousel.astro              # Task 12
│   │   └── InstagramGrid.astro                  # Task 9
│   ├── pages/
│   │   ├── index.astro                          # Task 7
│   │   ├── about.astro                          # Task 11
│   │   ├── contact.astro                        # Task 11
│   │   └── events/
│   │       ├── index.astro                      # Task 8
│   │       └── [...slug].astro                  # Task 10
│   └── styles/
│       └── global.css                           # Task 5
└── docs/
    └── superpowers/
        ├── specs/                               # already exists
        └── plans/                               # already exists
```

**File responsibilities (boundaries):**

- `src/data/site.json` — single source of truth for global config (email, social links, Google Form URL, behold widget ID). The editor's only structured-config touch point.
- `src/lib/siteConfig.ts` — loads + validates site.json at build time. Pages import from here, never from raw YAML.
- `src/lib/events.ts` — pure functions for filtering/sorting events. No Astro dependencies; unit-tested in isolation.
- `src/content/config.ts` — Zod schemas for all content collections.
- `src/components/*.astro` — presentational. Each one has one responsibility.
- `src/pages/*.astro` — composes components. Minimal logic; mostly wiring data to components.

---

## Task 1: Scaffold Astro project with Tailwind

**Goal:** Create the working Astro + Tailwind project in the current empty directory, init git, make the first commit.

**Files:**
- Create: `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `.gitignore`, `public/favicon.svg`, `src/pages/index.astro` (placeholder from scaffold)

- [ ] **Step 1: Verify pnpm is available**

Run: `pnpm --version`
Expected: a version string (any 8.x or 9.x is fine). If missing: `npm install -g pnpm` first.

- [ ] **Step 2: Create `.npmrc` BEFORE scaffolding to enforce exact-pin policy**

Create `.npmrc` in the project root:
```
save-exact=true
save-prefix=
engine-strict=true
```

This guarantees that any subsequent `pnpm add` writes exact versions, not `^`-prefixed.

- [ ] **Step 3: Scaffold Astro into the current directory**

Run from `/Users/theodorecurtil/Desktop/elefantoz/tsering`:
```bash
pnpm create astro@latest . --template minimal --typescript strict --install --no-git
```

When prompted "directory not empty" (because `docs/` and `.npmrc` already exist), choose **"Continue"**. Do not let the scaffold delete existing files.

Expected: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `public/favicon.svg`, `node_modules/` all created. The `pnpm create` step ignores `.npmrc` `save-exact` for its own writes (it adds `^`-prefixed versions); we'll fix this in step 5.

- [ ] **Step 4: Add Tailwind via Astro's official integration**

Run: `pnpm astro add tailwind`

Accept all prompts (Y to install, Y to update config). This adds `@astrojs/tailwind`, `tailwindcss`, creates `tailwind.config.mjs`, and updates `astro.config.mjs`.

Expected: `tailwind.config.mjs` exists; `astro.config.mjs` now has `import tailwind from '@astrojs/tailwind'` and `integrations: [tailwind()]`.

- [ ] **Step 5: Pin all direct dependency versions (remove `^` and `~`)**

Open `package.json`. In every `dependencies` and `devDependencies` entry, remove any leading `^` or `~` so the version is exact. For example:

```json
"astro": "^5.0.0"
```
becomes:
```json
"astro": "5.0.0"
```

Use the actual versions that the scaffold installed (do not invent versions — copy what's currently there, just strip the prefix).

Then regenerate the lockfile:
```bash
pnpm install
```

Expected: `pnpm-lock.yaml` updated; `package.json` shows no `^`/`~`. Verify by running:
```bash
grep -E '"\^|"~' package.json && echo "FAIL: prefixes remain" || echo "OK: all pinned"
```

Expected: `OK: all pinned`.

- [ ] **Step 6: Verify dev server boots**

Run: `pnpm dev`

Open `http://localhost:4321` in a browser. Expected: the default Astro placeholder page renders with no console errors. Stop the server (Ctrl+C).

- [ ] **Step 7: Verify production build succeeds**

Run: `pnpm build`

Expected: `dist/` directory created; output ends with "Build complete!" or similar success message; no errors.

- [ ] **Step 8: Write .gitignore (and remove any auto-init `.git` if present)**

If `pnpm create astro` initialized a git repo despite `--no-git` (check with `ls -la | grep .git`), remove it: `rm -rf .git`.

Create `.gitignore`:
```
node_modules/
dist/
.astro/
.DS_Store
*.log
.env
.env.*
!.env.example
```

- [ ] **Step 9: Initialize git and first commit**

```bash
git init -b main
git add .
git commit -m "chore: scaffold Astro + Tailwind project with pinned deps"
```

Expected: commit succeeds. The `docs/` folder (containing the spec and plan) is included.

- [ ] **Step 10: Add the GitHub remote and push**

```bash
git remote add origin git@github.com:Tseringw/artclub-website.git
git push -u origin main
```

Expected: push succeeds; `main` tracks `origin/main`. From here on, every push to `main` will trigger a Cloudflare Pages deploy once that's wired up (Task 13 / README §5).

---

## Task 2: Site config (site.json + loader, no extra deps)

**Goal:** Define the global config and a typed loader. Use plain JSON — no parser dep needed (TypeScript handles JSON imports natively because Astro's `tsconfig` enables `resolveJsonModule`). Validate with Zod (re-exported by Astro, so no new install).

**Files:**
- Create: `src/data/site.json`
- Create: `src/lib/siteConfig.ts`

- [ ] **Step 1: Create the sample site.json**

Create `src/data/site.json`:
```json
{
  "siteName": "Tsering",
  "tagline": "Your student association tagline here",
  "contactEmail": "hello@example.com",
  "googleFormUrl": "https://docs.google.com/forms/d/e/REPLACE_ME/viewform",
  "beholdWidgetId": "REPLACE_ME",
  "socialLinks": {
    "instagram": "https://www.instagram.com/your-handle/",
    "email": "hello@example.com"
  }
}
```

JSON does not allow comments — field documentation lives in the README's content-editing section.

- [ ] **Step 2: Create the typed loader**

Create `src/lib/siteConfig.ts`:
```ts
import { z } from 'astro:content';
import siteData from '../data/site.json';

const SiteConfigSchema = z.object({
  siteName: z.string(),
  tagline: z.string(),
  contactEmail: z.string().email(),
  googleFormUrl: z.string().url(),
  beholdWidgetId: z.string(),
  socialLinks: z.object({
    instagram: z.string().url(),
    email: z.string().email(),
  }),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export const siteConfig: SiteConfig = SiteConfigSchema.parse(siteData);
```

Notes:
- `z` is re-exported by `astro:content` from Zod — keeps one Zod version across the project.
- The JSON import is statically resolved by Vite/Astro at build time. Validation runs at module load (build time), so a malformed `site.json` fails the build with a clear Zod error rather than crashing at runtime.

- [ ] **Step 3: Verify build still passes**

Run: `pnpm build`

Expected: build succeeds. The loader is imported at build time; no page consumes it yet, but the validation runs.

- [ ] **Step 4: Verify validation catches errors (smoke test)**

Temporarily break `src/data/site.json` — e.g. change `"contactEmail": "hello@example.com"` to `"contactEmail": "not-an-email"`. Run `pnpm build`.

Expected: build fails with a Zod validation error mentioning `contactEmail` and "Invalid email".

Restore the original value. Run `pnpm build` again to confirm it passes.

- [ ] **Step 5: Commit**

```bash
git add src/data/site.json src/lib/siteConfig.ts
git commit -m "feat: add site config (JSON + Zod-validated loader)"
```

---

## Task 3: Content collection schemas

**Goal:** Define Zod schemas for `events` and `site` content collections so frontmatter is validated and types are inferred.

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Create the content config**

Create `src/content/config.ts`:
```ts
import { defineCollection, z } from 'astro:content';

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    lumaUrl: z.string().url(),
    coverImage: z.string().optional(),
    instagramPosts: z.array(z.string().url()).optional().default([]),
  }),
});

const site = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
  }),
});

export const collections = { events, site };
```

- [ ] **Step 2: Verify Astro picks up the schemas**

Run: `pnpm astro sync`

Expected: completes without errors; generates `.astro/` types.

- [ ] **Step 3: Verify build still passes**

Run: `pnpm build`

Expected: succeeds. Build will warn that the `events` and `site` collections are empty — that's fine; we add content next.

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: define events and site content collection schemas"
```

---

## Task 4: Sample content (markdown files)

**Goal:** Create one upcoming event, one past event, and the three site-text files. Subsequent tasks need real content to render.

**Files:**
- Create: `src/content/events/2026-06-15-spring-gala.md`
- Create: `src/content/events/2026-03-10-welcome-night.md`
- Create: `src/content/site/home.md`
- Create: `src/content/site/about.md`
- Create: `src/content/site/contact.md`

- [ ] **Step 1: Create the upcoming sample event**

Create `src/content/events/2026-06-15-spring-gala.md`:
```markdown
---
title: "Spring Gala 2026"
date: 2026-06-15
lumaUrl: "https://lu.ma/example-spring-gala"
---

Join us for our annual Spring Gala — a night of music, food, and conversation
to close out the academic year.

## What to expect

- Live music from local student bands
- A three-course dinner
- Photo booth and dance floor

## Practical info

- **Where:** Main Hall, University Campus
- **When:** Saturday, June 15th, 19:00
- **Dress code:** Smart casual
```

- [ ] **Step 2: Create the past sample event**

Create `src/content/events/2026-03-10-welcome-night.md`:
```markdown
---
title: "Welcome Night 2026"
date: 2026-03-10
lumaUrl: "https://lu.ma/example-welcome-night"
instagramPosts:
  - "https://www.instagram.com/p/EXAMPLE1/"
  - "https://www.instagram.com/p/EXAMPLE2/"
---

A relaxed evening to welcome new members to the association.

We had drinks, snacks, and a quick round of introductions to help everyone
get to know each other.

Thanks to everyone who came out — see the photos below!
```

- [ ] **Step 3: Create the site-text files**

Create `src/content/site/home.md`:
```markdown
---
title: "Welcome to Tsering"
---

We are a student association dedicated to [your mission here].
Edit this paragraph in `src/content/site/home.md`.
```

Create `src/content/site/about.md`:
```markdown
---
title: "About us"
---

# About us

Tell the story of the association here. Edit this page in
`src/content/site/about.md` on github.com.

## Our mission

What you stand for.

## The team

Who runs the association.
```

Create `src/content/site/contact.md`:
```markdown
---
title: "Contact"
---

# Contact

Get in touch — edit this page in `src/content/site/contact.md`.

## Where to find us

[Location, building, room, or link to a map]

## Email

See the email at the top/bottom of this page.
```

- [ ] **Step 4: Verify content validates**

Run: `pnpm astro sync`

Expected: completes with no schema errors (frontmatter matches schemas from Task 3).

- [ ] **Step 5: Commit**

```bash
git add src/content/
git commit -m "feat: add sample events and site-text markdown"
```

---

## Task 5: BaseLayout + global styles

**Goal:** Provide a single layout used by every page. Header with site name + nav, footer with email + Instagram link. Minimal styling — visual polish is the `frontend-design` skill's job later.

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/styles/global.css`
- Modify: `src/pages/index.astro` (replace scaffold content with one using BaseLayout)

- [ ] **Step 1: Create global stylesheet**

Create `src/styles/global.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  font-family: system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 2: Create BaseLayout**

Create `src/layouts/BaseLayout.astro`:
```astro
---
import { siteConfig } from '../lib/siteConfig';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}

const { title, description } = Astro.props;
const fullTitle = title ? `${title} — ${siteConfig.siteName}` : siteConfig.siteName;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{fullTitle}</title>
    {description && <meta name="description" content={description} />}
  </head>
  <body class="min-h-screen flex flex-col">
    <header class="border-b">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" class="font-semibold text-lg">{siteConfig.siteName}</a>
        <nav>
          <ul class="flex gap-6 text-sm">
            <li><a href="/">Home</a></li>
            <li><a href="/events">Events</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t mt-16">
      <div class="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-600">
        <p>© {new Date().getFullYear()} {siteConfig.siteName}</p>
        <div class="flex gap-4">
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
    </footer>
  </body>
</html>
```

- [ ] **Step 3: Replace the scaffolded index page with one using BaseLayout**

Replace `src/pages/index.astro` entirely with:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Home">
  <div class="max-w-5xl mx-auto px-4 py-8">
    <p>Home page placeholder — populated in Task 7.</p>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Verify dev server renders**

Run: `pnpm dev`

Open `http://localhost:4321`. Expected: header with "Tsering" + nav links, footer with email + Instagram link, placeholder text in the middle. No console errors. Stop server.

- [ ] **Step 5: Verify build**

Run: `pnpm build`

Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro src/styles/global.css src/pages/index.astro
git commit -m "feat: add BaseLayout with header/footer and global styles"
```

---

## Task 6: Event sorting/filtering utilities (TDD)

**Goal:** Pure functions to split events into upcoming and past, sorted correctly. This is the only logic-heavy code; we use real TDD because there are clear input/output cases (date boundaries, sort order, edge cases).

**Files:**
- Create: `src/lib/events.ts`
- Create: `src/lib/events.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (add vitest)

- [ ] **Step 1: Install vitest**

```bash
pnpm add -D vitest
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add test script to package.json**

Edit `package.json` — in the `"scripts"` section, add `"test": "vitest run"`.

- [ ] **Step 4: Write the failing tests first**

Create `src/lib/events.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { partitionEvents, type EventLike } from './events';

const make = (slug: string, date: string): EventLike => ({
  slug,
  data: { date: new Date(date) },
});

describe('partitionEvents', () => {
  const today = new Date('2026-05-02T12:00:00Z');

  it('puts events on or after today into upcoming, sorted ascending', () => {
    const events: EventLike[] = [
      make('c', '2026-09-01'),
      make('a', '2026-06-15'),
      make('b', '2026-07-20'),
    ];
    const { upcoming } = partitionEvents(events, today);
    expect(upcoming.map(e => e.slug)).toEqual(['a', 'b', 'c']);
  });

  it('puts events before today into past, sorted descending (most recent first)', () => {
    const events: EventLike[] = [
      make('x', '2026-01-10'),
      make('y', '2026-03-15'),
      make('z', '2025-11-01'),
    ];
    const { past } = partitionEvents(events, today);
    expect(past.map(e => e.slug)).toEqual(['y', 'x', 'z']);
  });

  it('treats events on the same day as today as upcoming', () => {
    const events: EventLike[] = [make('today', '2026-05-02')];
    const { upcoming, past } = partitionEvents(events, today);
    expect(upcoming.map(e => e.slug)).toEqual(['today']);
    expect(past).toEqual([]);
  });

  it('handles an empty list', () => {
    const { upcoming, past } = partitionEvents([], today);
    expect(upcoming).toEqual([]);
    expect(past).toEqual([]);
  });

  it('correctly partitions a mix of upcoming and past', () => {
    const events: EventLike[] = [
      make('past1', '2026-01-10'),
      make('future1', '2026-08-15'),
      make('past2', '2026-04-20'),
      make('future2', '2026-06-05'),
    ];
    const { upcoming, past } = partitionEvents(events, today);
    expect(upcoming.map(e => e.slug)).toEqual(['future2', 'future1']);
    expect(past.map(e => e.slug)).toEqual(['past2', 'past1']);
  });
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `pnpm test`

Expected: FAIL with "Cannot find module './events'" or "partitionEvents is not exported".

- [ ] **Step 6: Implement the minimal events.ts to pass**

Create `src/lib/events.ts`:
```ts
export interface EventLike {
  slug: string;
  data: { date: Date };
}

export interface Partitioned<T extends EventLike> {
  upcoming: T[];
  past: T[];
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function partitionEvents<T extends EventLike>(
  events: T[],
  now: Date = new Date()
): Partitioned<T> {
  const cutoff = startOfDay(now);

  const upcoming = events
    .filter(e => startOfDay(e.data.date) >= cutoff)
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());

  const past = events
    .filter(e => startOfDay(e.data.date) < cutoff)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return { upcoming, past };
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `pnpm test`

Expected: all 5 tests pass.

- [ ] **Step 8: Verify build still works**

Run: `pnpm build`

Expected: succeeds.

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts src/lib/events.ts src/lib/events.test.ts
git commit -m "feat: add event partitioning utility with tests"
```

---

## Task 7: Home page (hero + upcoming events + Join us CTA)

**Goal:** Wire the home page: hero from `home.md`, list of next 3 upcoming events, "Join us" button linking to the Google Form. Skip the Instagram carousel for now (Task 12).

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/EventCard.astro`
- Create: `src/components/UpcomingEvents.astro`
- Create: `src/components/JoinUsCTA.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create Hero component**

Create `src/components/Hero.astro`:
```astro
---
import { getEntry } from 'astro:content';

const home = await getEntry('site', 'home');
if (!home) throw new Error('src/content/site/home.md is missing');
const { Content } = await home.render();
---
<section class="max-w-5xl mx-auto px-4 py-12">
  <h1 class="text-4xl font-bold mb-4">{home.data.title ?? 'Welcome'}</h1>
  <div class="prose max-w-none">
    <Content />
  </div>
</section>
```

- [ ] **Step 2: Create EventCard component**

Create `src/components/EventCard.astro`:
```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  event: CollectionEntry<'events'>;
}
const { event } = Astro.props;

const dateStr = event.data.date.toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
---
<a href={`/events/${event.slug}`} class="block border rounded-lg p-4 hover:bg-gray-50 transition">
  <p class="text-sm text-gray-600">{dateStr}</p>
  <h3 class="text-lg font-semibold mt-1">{event.data.title}</h3>
</a>
```

- [ ] **Step 3: Create UpcomingEvents component**

Create `src/components/UpcomingEvents.astro`:
```astro
---
import { getCollection } from 'astro:content';
import { partitionEvents } from '../lib/events';
import EventCard from './EventCard.astro';

interface Props {
  limit?: number;
}
const { limit = 3 } = Astro.props;

const all = await getCollection('events');
const { upcoming } = partitionEvents(all);
const display = upcoming.slice(0, limit);
---
<section class="max-w-5xl mx-auto px-4 py-8">
  <div class="flex items-baseline justify-between mb-4">
    <h2 class="text-2xl font-bold">Upcoming events</h2>
    <a href="/events" class="text-sm underline">See all</a>
  </div>
  {display.length === 0 ? (
    <p class="text-gray-600">No upcoming events right now — check back soon.</p>
  ) : (
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {display.map(event => <EventCard event={event} />)}
    </div>
  )}
</section>
```

- [ ] **Step 4: Create JoinUsCTA component**

Create `src/components/JoinUsCTA.astro`:
```astro
---
import { siteConfig } from '../lib/siteConfig';
---
<section class="max-w-5xl mx-auto px-4 py-12 text-center">
  <h2 class="text-2xl font-bold mb-3">Join the association</h2>
  <p class="mb-6 text-gray-700">Become a member — fill in the form, we'll get in touch.</p>
  <a
    href={siteConfig.googleFormUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition"
  >
    Join us
  </a>
</section>
```

- [ ] **Step 5: Wire the home page**

Replace `src/pages/index.astro` entirely with:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import UpcomingEvents from '../components/UpcomingEvents.astro';
import JoinUsCTA from '../components/JoinUsCTA.astro';
---
<BaseLayout title="Home">
  <Hero />
  <UpcomingEvents />
  <JoinUsCTA />
</BaseLayout>
```

- [ ] **Step 6: Verify the home page renders**

Run: `pnpm dev`

Open `http://localhost:4321`. Expected:
- Header with nav.
- Hero with "Welcome to Tsering" and the placeholder paragraph.
- "Upcoming events" section listing the Spring Gala 2026 card (assuming today < 2026-06-15; if tests run after that date, adjust the sample event date).
- "Join us" CTA with a button (currently links to placeholder Google Form URL).
- Footer.

Stop server.

- [ ] **Step 7: Verify build**

Run: `pnpm build`

Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/components/ src/pages/index.astro
git commit -m "feat: build home page with hero, upcoming events, and join CTA"
```

---

## Task 8: Events index page

**Goal:** Page at `/events` listing all events — upcoming first (ascending), then past (most-recent first).

**Files:**
- Create: `src/pages/events/index.astro`

- [ ] **Step 1: Create the events index page**

Create `src/pages/events/index.astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
import { partitionEvents } from '../../lib/events';
import EventCard from '../../components/EventCard.astro';

const all = await getCollection('events');
const { upcoming, past } = partitionEvents(all);
---
<BaseLayout title="Events">
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-12">
    <section>
      <h1 class="text-3xl font-bold mb-6">Upcoming events</h1>
      {upcoming.length === 0 ? (
        <p class="text-gray-600">No upcoming events right now.</p>
      ) : (
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map(event => <EventCard event={event} />)}
        </div>
      )}
    </section>

    {past.length > 0 && (
      <section>
        <h2 class="text-2xl font-bold mb-6">Past events</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {past.map(event => <EventCard event={event} />)}
        </div>
      </section>
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verify it renders**

Run: `pnpm dev`

Open `http://localhost:4321/events`. Expected:
- "Upcoming events" with the Spring Gala card.
- "Past events" with the Welcome Night card.

Stop server.

- [ ] **Step 3: Verify build**

Run: `pnpm build`

Expected: succeeds; both `events/index.html` and the (still-missing) detail pages should be flagged in build output. Detail pages are Task 10.

- [ ] **Step 4: Commit**

```bash
git add src/pages/events/index.astro
git commit -m "feat: add events index page"
```

---

## Task 9: InstagramGrid component

**Goal:** A presentational component that takes an array of Instagram post URLs and renders them as a responsive grid using Instagram's official `<blockquote>` embeds. Loads `embeds.js` once. Renders nothing if the array is empty.

**Files:**
- Create: `src/components/InstagramGrid.astro`

- [ ] **Step 1: Create InstagramGrid**

Create `src/components/InstagramGrid.astro`:
```astro
---
interface Props {
  posts: string[];
}
const { posts } = Astro.props;
---
{posts.length > 0 && (
  <section class="max-w-5xl mx-auto px-4 py-8">
    <h2 class="text-2xl font-bold mb-4">Photos</h2>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map(url => (
        <blockquote
          class="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style="background:#FFF; border:0; margin: 0; max-width:540px; min-width:240px; padding:0; width:100%;"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">View on Instagram</a>
        </blockquote>
      ))}
    </div>
    <script async src="https://www.instagram.com/embed.js"></script>
  </section>
)}
```

Note: Instagram's `embed.js` finds all `.instagram-media` blockquotes on the page and replaces them with iframe embeds at runtime. The graceful fallback (when JS or the embed service fails) is the plain "View on Instagram" link inside each blockquote.

- [ ] **Step 2: Verify build**

Run: `pnpm build`

Expected: succeeds. (No page imports it yet — we use it in Task 10.)

- [ ] **Step 3: Commit**

```bash
git add src/components/InstagramGrid.astro
git commit -m "feat: add InstagramGrid component using official blockquote embeds"
```

---

## Task 10: Event detail page (`/events/<slug>`)

**Goal:** Dynamic route rendering each event: title, date, "Register on Luma" button, markdown body, optional Instagram photo grid.

**Files:**
- Create: `src/pages/events/[...slug].astro`

- [ ] **Step 1: Create the dynamic route**

Create `src/pages/events/[...slug].astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import InstagramGrid from '../../components/InstagramGrid.astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export async function getStaticPaths() {
  const events = await getCollection('events');
  return events.map(event => ({
    params: { slug: event.slug },
    props: { event },
  }));
}

interface Props {
  event: CollectionEntry<'events'>;
}
const { event } = Astro.props;
const { Content } = await event.render();

const dateStr = event.data.date.toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
---
<BaseLayout title={event.data.title}>
  <article class="max-w-3xl mx-auto px-4 py-8">
    <p class="text-sm text-gray-600">{dateStr}</p>
    <h1 class="text-3xl font-bold mt-1 mb-6">{event.data.title}</h1>

    <a
      href={event.data.lumaUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-block bg-black text-white px-5 py-2.5 rounded-md font-medium hover:bg-gray-800 transition mb-8"
    >
      Register on Luma →
    </a>

    <div class="prose max-w-none">
      <Content />
    </div>
  </article>

  <InstagramGrid posts={event.data.instagramPosts} />
</BaseLayout>
```

- [ ] **Step 2: Verify both event pages render**

Run: `pnpm dev`

Open `http://localhost:4321/events/2026-06-15-spring-gala`. Expected: title, date, "Register on Luma" button, prose body, no photos section.

Open `http://localhost:4321/events/2026-03-10-welcome-night`. Expected: same structure plus a "Photos" section. The Instagram embeds will fail to render the actual photos because the URLs are placeholders — they'll show the fallback "View on Instagram" link. That's correct behavior with placeholder data.

Stop server.

- [ ] **Step 3: Verify build**

Run: `pnpm build`

Expected: succeeds. Output shows static HTML built for both event slugs.

- [ ] **Step 4: Commit**

```bash
git add src/pages/events/\[...slug\].astro
git commit -m "feat: add event detail page with Luma button and photo grid"
```

---

## Task 11: About + Contact pages

**Goal:** Render the About and Contact markdown files into actual pages.

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/pages/contact.astro`

- [ ] **Step 1: Create About page**

Create `src/pages/about.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry } from 'astro:content';

const about = await getEntry('site', 'about');
if (!about) throw new Error('src/content/site/about.md is missing');
const { Content } = await about.render();
---
<BaseLayout title="About">
  <article class="max-w-3xl mx-auto px-4 py-8 prose">
    <Content />
  </article>
</BaseLayout>
```

- [ ] **Step 2: Create Contact page**

Create `src/pages/contact.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry } from 'astro:content';
import { siteConfig } from '../lib/siteConfig';

const contact = await getEntry('site', 'contact');
if (!contact) throw new Error('src/content/site/contact.md is missing');
const { Content } = await contact.render();
---
<BaseLayout title="Contact">
  <article class="max-w-3xl mx-auto px-4 py-8">
    <div class="prose max-w-none">
      <Content />
    </div>
    <div class="mt-8 pt-8 border-t space-y-2 text-sm">
      <p>
        <strong>Email:</strong>{' '}
        <a href={`mailto:${siteConfig.contactEmail}`} class="underline">{siteConfig.contactEmail}</a>
      </p>
      <p>
        <strong>Instagram:</strong>{' '}
        <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer" class="underline">
          @{siteConfig.socialLinks.instagram.split('/').filter(Boolean).pop()}
        </a>
      </p>
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Verify both render**

Run: `pnpm dev`

- `http://localhost:4321/about` — About markdown rendered.
- `http://localhost:4321/contact` — Contact markdown plus the structured email + Instagram block.

Stop server.

- [ ] **Step 4: Verify build**

Run: `pnpm build`

Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/about.astro src/pages/contact.astro
git commit -m "feat: add About and Contact pages"
```

---

## Task 12: Instagram carousel on home (behold.so)

**Goal:** Drop a behold.so widget on the home page above the upcoming events. Configurable widget ID via `site.json`.

**Files:**
- Create: `src/components/InstagramCarousel.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create the carousel component**

Create `src/components/InstagramCarousel.astro`:
```astro
---
import { siteConfig } from '../lib/siteConfig';

const widgetId = siteConfig.beholdWidgetId;
const isPlaceholder = widgetId === 'REPLACE_ME' || !widgetId;
---
<section class="max-w-5xl mx-auto px-4 py-8">
  <h2 class="text-2xl font-bold mb-4">Latest from our Instagram</h2>
  {isPlaceholder ? (
    <p class="text-sm text-gray-500 italic">
      Instagram widget not configured yet. Set <code>beholdWidgetId</code> in <code>src/data/site.json</code>.
    </p>
  ) : (
    <>
      <div data-behold-id={widgetId}></div>
      <script type="module" src="https://w.behold.so/widget.js"></script>
    </>
  )}
</section>
```

The placeholder branch keeps the page rendering correctly during development before behold is set up.

- [ ] **Step 2: Wire it into the home page**

Modify `src/pages/index.astro` — replace its content with:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import InstagramCarousel from '../components/InstagramCarousel.astro';
import UpcomingEvents from '../components/UpcomingEvents.astro';
import JoinUsCTA from '../components/JoinUsCTA.astro';
---
<BaseLayout title="Home">
  <Hero />
  <InstagramCarousel />
  <UpcomingEvents />
  <JoinUsCTA />
</BaseLayout>
```

- [ ] **Step 3: Verify the home page**

Run: `pnpm dev`

Open `http://localhost:4321`. Expected: Hero → "Latest from our Instagram" with the placeholder message → Upcoming events → Join us CTA. Stop server.

- [ ] **Step 4: Verify build**

Run: `pnpm build`

Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/InstagramCarousel.astro src/pages/index.astro
git commit -m "feat: add behold.so Instagram carousel on home page"
```

---

## Task 13: Astro production config + deploy prep

**Goal:** Set the production site URL in `astro.config.mjs`, ensure the build is Cloudflare-Pages-ready (it is by default for static output), and document the CF Pages connection steps in the README (deferred to Task 14).

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Set the site URL**

Edit `astro.config.mjs`. Add a `site` key. The user has a custom domain — if it's known at this point, fill it in; otherwise leave the placeholder for them to swap later.

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://example.com', // TODO: replace with the real custom domain before deploy
  integrations: [tailwind()],
});
```

The exact line(s) to edit depend on what `pnpm astro add tailwind` produced — keep the `integrations: [tailwind()]` line as-is and just add the `site:` key.

- [ ] **Step 2: Verify build**

Run: `pnpm build`

Expected: succeeds. Output mentions the configured `site:` URL when generating any sitemap/canonical info.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "chore: set production site URL in astro config"
```

---

## Task 14: Comprehensive README

**Goal:** Write the README documenting decisions, deploy, content editing, integrations, maintenance, troubleshooting — per spec §8.

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

Create `README.md`:
```markdown
# Tsering — Student Association Website

A simple static site for a student association. Wraps Instagram, Luma, and a Google Form into a small set of editable pages.

## 1. What this is

- **Home** — short intro, latest Instagram posts (carousel), upcoming events, "Join us" form button.
- **Events** — index page plus a detail page per event, with a registration button to Luma and a photo grid (Instagram embeds) added after the event.
- **About** — free-form prose page.
- **Contact** — email and social links.

The site is fully static. There is no login, no database, no backend.

## 2. Tech stack & why

| Area | Choice | Why |
|---|---|---|
| Framework | Astro 5.x | Best SSG for content-heavy sites; great markdown support; ships almost zero JS. |
| Styling | Tailwind CSS | Utility-first; fast iteration; well-audited; no design-system overhead. |
| Hosting | Cloudflare Pages | Free, generous bandwidth, deploys on `git push`, easy custom domain. |
| Repo | GitHub | The github.com web editor is the editor's primary content tool. |
| Package manager | pnpm | Default standard; works on CF Pages. |
| Site config | JSON + Zod | Native TS JSON import (no parser dep); validated at build time. |

Alternatives considered: Next.js (heavier, app-oriented), Hugo (less ergonomic for embeds), Vercel (equivalent to CF Pages — pick if preferred), Decap CMS (rejected — adds maintenance surface for marginal UX gain on a mostly-read-only site), YAML for site config (rejected — would add `js-yaml` for marginal editor UX gain on an "almost-never-edited" file).

## 2.1 Security & dependency policy

This site follows a strict-by-default dependency posture:

- **Exact pinning.** No `^` or `~` in `package.json`. `.npmrc` enforces `save-exact=true` so `pnpm add` always writes pinned versions.
- **Locked transitive deps.** `pnpm-lock.yaml` is committed.
- **Minimal direct deps.** Total: `astro`, `@astrojs/tailwind`, `tailwindcss` (runtime); `vitest`, `typescript`, `@astrojs/check` (dev only). Nothing exotic.
- **No runtime third-party JS via npm.** External JS comes from two `<script>` tags loaded by URL: behold.so on the home page, Instagram `embed.js` on event detail pages with photos. Both render gracefully if the script fails (carousel hidden / "View on Instagram" link fallback).
- **Upgrades are explicit.** To bump a dep, run `pnpm update <name> --latest`, review the changelog, run `pnpm test && pnpm build`, then commit with the version change in the message.

## 3. Repo layout

```
src/
├── content/
│   ├── config.ts              # collection schemas
│   ├── events/                # one .md per event
│   └── site/                  # home.md, about.md, contact.md
├── data/
│   └── site.json               # site-wide config
├── lib/
│   ├── siteConfig.ts          # loads + validates site.json
│   └── events.ts              # event sorting/filtering
├── layouts/
│   └── BaseLayout.astro
├── components/                # presentational Astro components
├── pages/                     # routes
└── styles/global.css
```

## 4. Local dev

Prerequisites: Node 20+, pnpm 9+.

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # production build into ./dist
pnpm test         # run unit tests (vitest)
```

## 5. Deploy

### One-time setup (Cloudflare Pages)

1. Push the repo to GitHub.
2. In the Cloudflare dashboard → Workers & Pages → Create application → Pages → Connect to Git.
3. Select the repo. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Environment variable:** `NODE_VERSION = 20` (or higher)
4. Save and deploy. The first deploy gives you a `<project>.pages.dev` URL.
5. Add your custom domain: project → Custom domains → Set up. Update DNS as instructed.

### Updates

Push to `main` → CF Pages rebuilds in ~30 seconds. Branches and PRs get preview deploys automatically.

### Rollback

CF Pages dashboard → Deployments → click any prior deploy → "Rollback to this deployment".

## 6. Content editing guide (for non-devs)

All content is edited on github.com. You don't need to install anything.

### Edit an existing page

1. Go to the repo on github.com.
2. Click into `src/content/site/` → click the file you want to edit (e.g. `about.md`).
3. Click the ✏️ pencil icon.
4. Edit the text. Anything between `---` lines at the top is structured data (don't change the field names). Below that, use [markdown](https://www.markdownguide.org/basic-syntax/) for headings, lists, links, etc.
5. Scroll to the bottom → "Commit changes…" → write a short message → "Commit changes".
6. Wait ~30 seconds, then refresh the live site.

### Add a new event

1. Go to `src/content/events/` on github.com → "Add file" → "Create new file".
2. Name it like `2026-09-15-autumn-mixer.md` (date prefix keeps the folder organized; the URL slug comes from the full filename minus `.md`).
3. Paste this template and fill it in:

   ```markdown
   ---
   title: "Your Event Title"
   date: 2026-09-15
   lumaUrl: "https://lu.ma/your-luma-event-id"
   ---

   The full description of your event goes here. You can use multiple
   paragraphs, **bold**, *italic*, [links](https://example.com), and lists:

   - one
   - two
   ```

4. Commit. The event appears on the site within ~30 seconds.

### Add post-event photos

1. After the event, post the photos to Instagram as usual.
2. For each photo (or carousel), copy its Instagram URL (e.g. `https://www.instagram.com/p/ABCDE/`).
3. On github.com, open the event's `.md` file → click ✏️.
4. Add an `instagramPosts:` list in the frontmatter (between the `---` lines):
   ```yaml
   instagramPosts:
     - "https://www.instagram.com/p/ABCDE/"
     - "https://www.instagram.com/p/FGHIJ/"
   ```
5. Commit. Photos appear on the event detail page within ~30 seconds.

### Change site config

`src/data/site.json` holds site-wide settings: email, social links, Google Form URL, behold widget ID. Edit on github.com the same way.

**JSON syntax rules (different from markdown):**
- Every key must be in `"double quotes"`.
- Strings must be in `"double quotes"`.
- No comments (lines starting with `//` or `#`) — JSON does not allow them.
- No trailing commas after the last item in an object or array.
- If you break these rules, the next deploy will fail with a clear error message naming the field and the problem. Just fix and re-commit.

**Field reference:**
- `siteName` — site name shown in the header and tab title.
- `tagline` — short phrase used near the hero (optional in design).
- `contactEmail` — primary email; appears in footer and contact page.
- `googleFormUrl` — full URL of the Google Form for membership signup.
- `beholdWidgetId` — the widget ID from your behold.so dashboard. While set to `"REPLACE_ME"`, the home page shows a placeholder instead of the carousel.
- `socialLinks.instagram` — full URL to the association's Instagram profile.
- `socialLinks.email` — same as `contactEmail` (kept separate so social blocks can reference it as a "social link").

## 7. Integrations reference

| Service | What it does | Where it's configured | How to swap |
|---|---|---|---|
| **behold.so** | Instagram carousel on the home page | `beholdWidgetId` in `src/data/site.json`; widget script in `src/components/InstagramCarousel.astro` | Replace the script + data attribute with snapwidget.com (or similar) markup. One file. |
| **Instagram embeds** | Per-event photo grids | `instagramPosts:` array in each event's frontmatter | N/A — Instagram-native |
| **Luma** | Event registration | `lumaUrl` in each event's frontmatter | N/A — just swap the URL |
| **Google Form** | Membership signup | `googleFormUrl` in `src/data/site.json` | Swap the URL |
| **Cloudflare Pages** | Hosting + CI/CD | CF dashboard | Move to Vercel: import the repo, set build command `pnpm build`, output dir `dist` |

## 8. Common maintenance tasks

- **Change contact email:** edit `contactEmail` and `socialLinks.email` in `src/data/site.json`.
- **Swap the Instagram widget service:** edit `src/components/InstagramCarousel.astro`. Replace the `<div>` + `<script>` with the new service's snippet. Update `site.json` if the widget ID format changes.
- **Add a new top-level page (e.g. `/sponsors`):**
  1. Create `src/content/site/sponsors.md` with frontmatter + body.
  2. Create `src/pages/sponsors.astro` mirroring `about.astro`.
  3. Add a link to the new page in the nav inside `src/layouts/BaseLayout.astro`.
- **Change the domain:** update `site:` in `astro.config.mjs`, then attach the new domain in CF Pages.
- **Disable an event temporarily:** delete the event's `.md` file (keep the `.md` somewhere else if you'll restore it).

## 9. Troubleshooting

- **Build fails on CF Pages but works locally:** check the Node version env var (set `NODE_VERSION = 20` or higher in the CF dashboard).
- **Deploy stuck "in progress":** trigger a new deploy from the dashboard, or push an empty commit (`git commit --allow-empty -m "trigger deploy"`).
- **Instagram embeds show only "View on Instagram" links:** Instagram's `embed.js` failed to load (rate-limited, blocked, or post is private). Refresh; if persistent, the post may be from a private account.
- **behold widget shows nothing:** check `beholdWidgetId` in `site.json` matches the ID in the behold dashboard, and that the connected Instagram account has at least one public post.
- **Frontmatter validation error in build log:** check that the event's frontmatter matches the schema in `src/content/config.ts` — `date` must be a valid date, `lumaUrl` must be a valid URL.

## 10. Specs and plans

Design and implementation history live in:
- `docs/superpowers/specs/` — design specs
- `docs/superpowers/plans/` — implementation plans
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README"
```

---

## Task 15: Final smoke test

**Goal:** End-to-end verification that everything works together.

- [ ] **Step 1: Clean install**

```bash
rm -rf node_modules dist .astro
pnpm install
```

Expected: clean install completes.

- [ ] **Step 2: Run unit tests**

Run: `pnpm test`

Expected: all tests pass.

- [ ] **Step 3: Run production build**

Run: `pnpm build`

Expected: succeeds, no errors. Verify in the output that all pages built: `index.html`, `about/index.html`, `contact/index.html`, `events/index.html`, `events/2026-06-15-spring-gala/index.html`, `events/2026-03-10-welcome-night/index.html`.

- [ ] **Step 4: Manual browser verification of the production build**

Run: `pnpm preview`

Open each route and confirm renders without console errors:
- `/` — hero, IG carousel placeholder, upcoming events with Spring Gala card, Join us CTA
- `/events` — Spring Gala in upcoming, Welcome Night in past
- `/events/2026-06-15-spring-gala` — title, date, Luma button, body
- `/events/2026-03-10-welcome-night` — same plus "Photos" section with placeholder embed fallbacks
- `/about` — About content
- `/contact` — Contact content + email/Instagram block

Stop preview server.

- [ ] **Step 5: Verify clean working tree**

```bash
git status
```

Expected: "nothing to commit, working tree clean".

- [ ] **Step 6: Print next steps**

Site is structurally complete and locally verified. Two follow-ups remain (intentionally out of this plan's scope):

1. **Visual design pass** — invoke the `frontend-design` skill against this codebase to produce distinctive, production-grade UI.
2. **Production wiring** — push the repo to GitHub, connect Cloudflare Pages, attach the custom domain, replace `REPLACE_ME` values in `site.json` with real Google Form URL and behold widget ID.

---

## Self-review notes

**Spec coverage:**
- §1 Project summary → covered by Tasks 1–14 in aggregate.
- §2 Goals/non-goals → respected throughout (no auth, no CMS, no multi-language, no analytics).
- §3 Tech stack → Task 1, 2, 6 (vitest), 13 (deploy config), 14 (README documents).
- §4 Information architecture (5 pages, content sources) → Tasks 4 (content), 7 (home), 8 (events index), 10 (event detail), 11 (about/contact).
- §5 Integrations → Task 12 (behold.so), 9 (IG grid), 10 (Luma button), 7 (Google Form CTA).
- §6 Repo layout → matches the plan's File Structure section.
- §7 Workflows → documented in README (Task 14).
- §8 README plan → Task 14 covers all 9 sections.
- §9 Open questions → flagged in Task 13 (custom domain placeholder) and Task 15 step 6 (visual design + production wiring as follow-ups).

**Placeholder scan:** No "TBD" or "implement later" steps. All code is concrete. The only `REPLACE_ME` strings are intentional editor-facing config placeholders documented in the README.

**Type consistency:** `partitionEvents` signature is consistent across Task 6 (definition + tests) and Tasks 7, 8 (consumers). `siteConfig` schema fields are consistent across Task 2 (definition) and Tasks 5, 7, 11, 12 (consumers).

**Out-of-scope deliberately deferred:** Visual design (frontend-design skill, follow-up), real production credentials (Google Form, behold widget ID — editor populates), pushing to GitHub + connecting CF Pages (one-time human action, documented in README §5).
