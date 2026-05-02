# Tsering — Student Association Website (Design Spec)

**Date:** 2026-05-02
**Status:** Approved by user; ready for implementation planning

## 1. Project Summary

A simple website for a student association. The site is a thin wrapper around the association's existing presence on Instagram, Luma, and Google Forms. It primarily displays static information (about, contact) and surfaces dynamic content from external services. There is no authentication, no member management, and no backend application — the site is fully static.

The owner of the association (henceforth "the editor", a non-developer) must be able to update content herself by editing markdown files via the github.com web UI, including: editing page text, adding new events, and adding post-event Instagram photo links to existing events.

## 2. Goals & Non-goals

### Goals

- Static, fast, free to host.
- Editable by a non-developer through github.com (no local tooling, no admin panel).
- Aggregates Instagram (carousel + per-event photos), Luma (per-event registration), and Google Forms (membership signup) — without requiring API setup or paid integrations.
- Comprehensive README so future maintenance is self-serve.
- Custom domain from day one.

### Non-goals

- No user accounts, login, or member management.
- No CMS / admin panel (deliberately rejected — adds maintenance surface for marginal UX gain when the site is mostly read-only between events).
- No multi-language support (YAGNI; can be added later if she ends up writing in two languages).
- No event RSVP, ticketing, or capacity management — Luma owns that.
- No comments, blog, forum, gallery beyond per-event Instagram embeds.

## 3. Tech Stack & Decisions

| Area | Choice | Why | Alternatives considered |
|---|---|---|---|
| Framework | **Astro** | Best-in-class SSG for content-heavy sites; zero JS by default; great DX; first-class markdown content collections. | Next.js (heavier, app-oriented), Hugo (less ergonomic for embeds/components), Eleventy (smaller community). |
| Styling | **Tailwind CSS** | Astro's standard partner; fast utility-first; no design system overhead for a small site. | Plain CSS modules (more boilerplate), CSS-in-JS (overkill for static). |
| Hosting | **Cloudflare Pages** | Free, generous bandwidth, deploys on `git push`, preview deploys for branches, easy custom domain. | Vercel (equivalent; pick if user prefers); Netlify (older, less generous). |
| Repo / CI | **GitHub** | Editor edits content via github.com web UI; CF Pages auto-builds from pushes. | GitLab/Bitbucket (no advantage; web editor on github.com is the killer feature for the editor's workflow). |
| Package manager | **pnpm** | Default standard; fast installs; works fine on CF Pages. | npm/yarn (no strong reason to differ). |
| Visual design | **Use the `frontend-design` skill when designing the UI** | User explicitly requested this. The frontend-design skill handles distinctive, production-grade interfaces. | Default Tailwind/Astro starter aesthetics (rejected — too generic). |

## 4. Information Architecture

### Pages

| Path | Purpose |
|---|---|
| `/` | Home: hero, Instagram carousel, list of upcoming events (from local content), "Join us" CTA → Google Form. |
| `/about` | Free-form prose page about the association's mission and team. |
| `/events` | Index of all events, sorted with upcoming first, then past. Each links to the event's detail page. |
| `/events/<slug>` | Event detail: title, date, "Register on Luma" button, long description, post-event Instagram photo grid (when available). |
| `/contact` | Email, location, social links. |

### Content sources (what the editor edits)

| File | Contents | Edit frequency |
|---|---|---|
| `src/content/site/home.md` | Hero headline + intro paragraph for `/` | Rarely |
| `src/content/site/about.md` | Full About page prose | Rarely |
| `src/content/site/contact.md` | Contact info (markdown body), or structured fields | Almost never |
| `src/content/events/<slug>.md` | One markdown file per event | Each new event + once after for recap photos |
| `src/data/site.yml` | Global config: site name, contact email, social URLs, Instagram handle, Google Form URL, behold.so widget ID | Almost never |

### Event file shape

```yaml
---
title: "Spring Gala 2026"
date: 2026-06-15
lumaUrl: "https://lu.ma/your-event-id"
coverImage: "./cover.jpg"     # optional
instagramPosts:                # populated AFTER the event
  - "https://www.instagram.com/p/XYZ123/"
  - "https://www.instagram.com/p/ABC456/"
---

Long markdown description here. Multiple paragraphs, links, lists, etc.
```

The home page reads from this same `events` collection — filters for `date >= today`, sorts ascending, and shows the next N (e.g. 3). There is no separate "upcoming events" data source.

## 5. Integrations

### 5.1 Instagram carousel (home page)

- **Service:** [behold.so](https://behold.so) free tier (~25 posts).
- **Setup (one-time):** the editor connects her Instagram in behold's dashboard; behold gives back a `<script>` snippet and a widget ID.
- **Wiring:** widget ID lives in `src/data/site.yml`; the home page renders behold's `<script>` and a `<div>` placeholder.
- **Maintenance:** new IG posts auto-appear; nothing to push.
- **Swap path:** if behold's free tier becomes limiting, swap for snapwidget.com or similar — replace one `<script>` block; no other code changes.

### 5.2 Per-event Instagram photo grid (event detail pages)

- **Mechanism:** Instagram's official `<blockquote class="instagram-media">` embed for each post URL listed in the event's `instagramPosts:` frontmatter array.
- **Layout:** responsive CSS grid — 2 columns on mobile, 3–4 on desktop.
- **Click behavior:** opens the Instagram post on Instagram (Instagram's own post view; no in-page lightbox).
- **Script:** Instagram's `embeds.js` loaded once per event detail page (only if `instagramPosts` is non-empty).
- **Failure mode:** if Instagram changes their embed format or rate-limits, embeds may stop rendering. The fallback is graceful — the page still renders without the photos. README will document this.

### 5.3 Luma registration (event detail only)

- **Mechanism:** plain `<a>` link styled as a button on the event detail page, pointing at the event's `lumaUrl`.
- **Behavior:** opens Luma in a new tab; Luma handles RSVP/tickets/capacity.
- **No iframe, no embed** — keeps the site simple and avoids Luma's iframe styling concerns.

### 5.4 Google Form membership signup

- **Mechanism:** "Join us" CTA button on the home page links out to the Google Form URL (configured in `site.yml`), opening in a new tab.
- **Why not iframe:** Google's iframes are visually awkward and don't adapt well to the site's design. Linking out is cleaner and a familiar pattern for users.

## 6. Repo Layout

```
tsering/
├── README.md                          # comprehensive doc (see §8)
├── astro.config.mjs
├── tailwind.config.cjs
├── package.json
├── pnpm-lock.yaml
├── public/
│   └── favicon.svg, /assets/...
├── src/
│   ├── components/                    # Astro components (Hero, EventCard, InstagramGrid, ...)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro                # Home
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── events/
│   │   │   ├── index.astro            # Events index
│   │   │   └── [slug].astro           # Event detail
│   ├── content/
│   │   ├── config.ts                  # Astro content collection schemas
│   │   ├── site/                      # home.md, about.md, contact.md
│   │   └── events/                    # one .md per event
│   ├── data/
│   │   └── site.yml                   # global config
│   └── styles/
│       └── global.css
└── docs/
    └── superpowers/specs/
        └── 2026-05-02-tsering-website-design.md
```

## 7. Workflows

### 7.1 Editor workflow (non-technical, github.com only)

**Edit an existing page:**
1. Go to the repo on github.com.
2. Navigate to e.g. `src/content/site/about.md` and click the ✏️ pencil icon.
3. Edit the text in the textarea.
4. Click "Commit changes" → fill in a short message → confirm.
5. Wait ~30 seconds → site updates.

**Add a new event:**
1. Navigate to `src/content/events/` → click "Add file" → "Create new file".
2. Name it like `spring-gala-2026.md`.
3. Paste the event template (provided in README §6) and fill in title, date, Luma URL, description.
4. Commit.

**Update an event with photos after it happened:**
1. Open the event's `.md` file → click ✏️.
2. Add Instagram post URLs to the `instagramPosts:` list.
3. Commit.

### 7.2 Developer workflow

```bash
pnpm install
pnpm dev          # localhost preview
pnpm build        # production build (Cloudflare runs this)
git push          # triggers CF Pages deploy
```

Preview deploys are automatic for branches/PRs. Production deploys on push to `main`.

### 7.3 Deploy & domain

- Cloudflare Pages connected to the GitHub repo.
- Custom domain attached via Cloudflare DNS (the user already owns the domain).
- HTTPS automatic (CF-issued cert).
- `*.pages.dev` preview URL also active (kept as a fallback).

## 8. README Plan

The implementation deliverable includes a substantial `README.md` with the following sections:

1. **What this is** — short description of the site and its purpose.
2. **Tech stack & why** — table from §3 of this spec, plus alternatives considered.
3. **Repo layout** — folder map (from §6).
4. **Local dev** — clone, `pnpm install`, `pnpm dev`.
5. **Deploy** — how Cloudflare Pages is wired, how to attach a custom domain, how to roll back.
6. **Content editing guide (for non-devs)** — written for the editor, with screenshots once the site is up:
   - Editing a page on github.com
   - Adding a new event (with full event template to copy-paste)
   - Adding post-event photos
   - Changing site config (email, Google Form URL, etc.)
7. **Integrations reference table:**

   | Service | What it does | Where it's configured | How to swap |
   |---|---|---|---|
   | behold.so | Instagram carousel (home) | `<script>` in `BaseLayout.astro`; widget ID in `site.yml` | Replace with snapwidget.com or similar |
   | Instagram embeds | Per-event photo grids | URLs in event frontmatter | N/A — built into Instagram |
   | Luma | Event registration | `lumaUrl` in each event's frontmatter | N/A — swap the URL |
   | Google Form | Membership signup | `googleFormUrl` in `site.yml` | Swap the URL |
   | Cloudflare Pages | Hosting + CI | CF dashboard | Move to Vercel: connect repo, same build cmd |

8. **Common maintenance tasks** — change contact email, swap the IG widget service, add a new page, change the domain.
9. **Troubleshooting** — build fails, deploy stuck, IG embeds not loading, behold widget shows nothing.

## 9. Open Questions / Deferred Decisions

- **Custom domain string:** user has a domain; the literal value will be wired into Cloudflare config at deploy time. Does not affect architecture.
- **Visual design:** deferred to a separate phase using the `frontend-design` skill.
- **Content writing:** the actual prose for Home/About/Contact will be drafted by the editor during/after build. The spec defines structure, not content.
- **behold.so account:** the editor will need to sign up and connect her Instagram before the home carousel works. README will document this.

## 10. Out of Scope (Deliberate)

- Authentication / member portal
- Admin panel / CMS
- Newsletter / mailing list integration
- Analytics (can be added later via Cloudflare Web Analytics — one-line addition)
- Comments / forum
- Multi-language
- Server-side rendering / API routes
- Database

---

**Approval:** This design has been walked through section-by-section with the user and approved. The next step is to invoke the `writing-plans` skill to produce a detailed implementation plan.
