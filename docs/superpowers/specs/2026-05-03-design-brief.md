# Art Club Frankfurt — Design Brief

**Date:** 2026-05-03
**Status:** Approved by editor (Tsering); ready for `frontend-design` implementation pass.
**Source:** Discovery interview with Tsering (the editor / club founder), captured via the visual companion in `.superpowers/brainstorm/34450-1777808336/`.

This brief governs the **visual design** pass. It describes look, feel, layout, typography, color, and component direction. It does **not** specify what content goes on each page (that already exists in `src/content/`), and it does **not** describe the architectural / functional implementation (already shipped per `2026-05-02-tsering-website-design.md`).

The brief will be handed to the `frontend-design` skill, which will produce the actual styled components.

---

## 1. Brand DNA

### Adjectives (from Tsering)

> **fun · professional · inviting · curated · refined · thoughtful**

The vibe is *serious about art, but warm*. Picture a gallery that opens with mulled wine, or *Frieze* magazine if it actually wanted you to come hang out. Polished, considered, curated — but never cold or pretentious. People should feel welcome to come in even if they don't know much about art yet. The "fun" comes through in *boldness* and *opening-night energy*, **not** through cartoony shapes or playful illustrations.

### Color palette

**Primary:** white / off-white as the dominant canvas (~85% of pixel area).

**Brand color:** `#690000` — deep burgundy / oxblood. Confirmed exact value from Tsering's master file. Used for:
- Primary CTA buttons (filled or outlined)
- Links and highlight accents
- The hero gradient/overlay tone where photography permits
- Section anchors (e.g., the `@artclub_frankfurt →` accent on the IG section)

**Greys** (system tokens):
- `#1a1a1a` — primary text (near-black, not pure black for less harshness)
- `#555` — secondary text (muted, for metadata like dates and locations)
- `#888` — tertiary text (small labels, subtle metadata)
- `#e2e2e0` — hairline / divider color (very thin separators between sections)
- `#fafaf6` — optional warm-white background for occasional contrast bands

**Off-limits:**
- No accent colors beyond burgundy. No teal, no green, no secondary brand color.
- No saturated reds (red is `#690000`, not anything brighter).
- No gradients beyond what's natural in photography.

### Typography

Two-type system, mirroring Tsering's existing poster/brand work:

**Serif — Times New Roman** (literal; she designed her existing brand work in TNR). Used for:
- Wordmark (`ART CLUB FRANKFURT`)
- All page titles, section titles, body prose, manifesto / hero text, italic accents
- Anywhere editorial / magazine / gallery feel is wanted

We use TNR directly via the system font stack. No webfont download. Slightly retro, slightly gallery-catalog, deliberately on-brand. Weight 400 default; 700 for emphasis only when needed.

**Sans — Inter** (or whatever Tailwind v4's default sans stack provides). Used for:
- Navigation items
- Buttons / CTA labels
- Small uppercase labels (e.g., `UPCOMING`, `STUDENT INITIATIVE · GOETHE UNIVERSITY`)
- Anywhere a "stamp" / "tag" / "label" feel is wanted (small text, wide tracking)

Sans is **always uppercase, always tracked** in interface chrome (nav, buttons, labels). Lowercase mixed-case sans is rare and reserved for situations where TNR doesn't fit (e.g., URL strings, technical metadata).

### Photography style

- **Real photographs** — artwork, gallery interiors, campus shots, considered candids from past events.
- Considered, not casual. **No selfies, no party-snapshot energy.**
- B&W or low-saturation treatment is fine and on-brand (matches her existing IG aesthetic).
- The hero photo on the home page is **a campus shot** (Goethe University Westend campus or Frankfurt cultural-architecture context) — emotionally anchoring, not event-specific.
- Photos may be tinted with subtle burgundy overlays where the photo permits, to integrate with the brand color.

---

## 2. Layout principles

- **White is the canvas.** Burgundy is for highlights, not fills.
- **Centered hierarchy by default.** Wordmarks, page titles, hero text — all centered. Like a museum or gallery website (reference: hauserwirth.com).
- **Generous whitespace.** Sections are separated by big breathing room and hairline dividers, not heavy boxes or shadows.
- **Photography is the emotional engine.** The hero is a full-bleed image with overlay text. The rest of the page is mostly white with measured photo accents.
- **Editorial rhythm.** Small uppercase sans labels above big TNR titles, with thin metadata in TNR italic below — the magazine pattern.
- **Hairline dividers** (`#e2e2e0`, 1px) separate major sections. No heavy borders, no shadows, no card-stack visual style.

### Reference

**hauserwirth.com** — structural reference: centered serif wordmark, horizontal nav band, full-bleed image hero with overlay, generous white below.

---

## 3. Page-by-page direction

### 3.1 Home (`/`)

Layout from top to bottom:

1. **Wordmark band** — white background, centered `ART CLUB FRANKFURT` in TNR, ~22 px, letter-spacing `1.5px`. Padded vertically.
2. **Hairline divider.**
3. **Nav band** — white background.
   - Left: `HOME · EVENTS · ABOUT · CONTACT` in Inter uppercase, ~11 px, letter-spacing ~2.5 px, weight 500. Spaced with ~48 px gaps.
   - Right: `BECOME A MEMBER` button — Inter bold, 10 px, letter-spacing 2 px, **outline style** in burgundy (`#690000` border + text on white). On hover: filled burgundy.
4. **Hairline divider.**
5. **Hero — static "manifesto"**:
   - Aspect ratio: roughly `21/9` on desktop, taller on mobile.
   - Background: a campus photograph (Goethe University, or Frankfurt cultural-architecture). Real photo to be supplied later; for now use a placeholder identifying it as `[ campus photo · Goethe University ]`.
   - Subtle dark gradient overlay at the bottom for legibility.
   - Centered overlay text:
     - Main: `Connecting people through art.` — TNR, ~54 px, white, line-height ~1.1.
     - Subtitle: `Student initiative at Goethe University, Frankfurt.` — TNR italic, ~16 px, slightly translucent white.
   - **No CTA button in the hero.** The visitor's next move is to scroll or use the nav.
6. **Featured upcoming event** — white background, padded generously.
   - Small `UPCOMING` label, sans uppercase, centered, grey.
   - Event title in TNR, ~36 px, centered.
   - Date / location / metadata in TNR italic, centered, mid-grey.
   - Two CTAs side-by-side, centered:
     - **Primary**: `REGISTER ON LUMA` — filled burgundy button, white text, sans uppercase, letter-spaced.
     - **Secondary**: `SEE ALL EVENTS →` — burgundy text-only link, no border.
7. **Hairline divider.**
8. **Latest from Instagram section** — white background.
   - Section heading: `Latest from Instagram` in TNR, ~18 px, left-aligned.
   - Right-aligned link `@ARTCLUB_FRANKFURT →` in sans, burgundy, small.
   - Below: 4-up uniform grid of square thumbnails, sharp corners (or 2-4 px radius), tight gaps (~12 px). On wide screens may go to 8-up; on mobile, 2-up.
   - **Implementation: behold widget** (template set to a uniform grid; see §4 modularity note).
9. **Hairline divider.**
10. **Footer** — white, generous padding, hairline divider above.
    - Left: `© 2026 Art Club Frankfurt`
    - Right: `info@artclub-frankfurt.de` and `Instagram` links — small, sans, with burgundy on hover.

### 3.2 Events index (`/events`)

Editorial **list** layout (not a card grid). Each event is one row, separated by hairline dividers — like the table of contents in an art magazine.

1. Wordmark band, divider, nav band, divider (same as home).
2. Page title — `Events` in TNR, centered, ~36 px, padded vertically.
3. **Upcoming** section:
   - Section label `UPCOMING` in sans uppercase, centered, mid-grey.
   - Each upcoming event is a row, top-and-bottom hairline-bordered:
     - Top line: `MAY 6 · 5:30 PM` in sans uppercase, mid-grey.
     - Title: `Schirn Visit` in TNR, ~28 px, primary text color.
     - Subtitle: `Frankfurt · Schirn Kunsthalle · Free for members` in TNR italic, ~13 px, mid-grey.
     - Right side: a small `→` arrow indicating click-through, burgundy on hover.
     - Whole row clickable, links to event detail page.
   - Sorted ascending (soonest first).
4. **Past events** section (only rendered if at least one past event exists):
   - Section label `PAST EVENTS` in sans uppercase, centered, mid-grey.
   - Same row format as upcoming, sorted descending (most recent first).
5. Footer.

If there are zero upcoming events, render: `No upcoming events right now — check back soon.` in TNR italic, centered, mid-grey, in place of the upcoming list.

### 3.3 Event detail (`/events/<slug>`)

Editorial **article** layout. Centered, narrow column.

1. Header (wordmark + nav + dividers, same as everywhere).
2. Article body, max-width ~720 px, centered:
   - Small label `EVENT` in sans uppercase, centered, mid-grey (above the title).
   - Date / time line: `MAY 6 · 5:30 PM` in sans uppercase, centered, mid-grey, small.
   - Title in TNR, ~48 px, centered, line-height ~1.1.
   - Subtitle / location in TNR italic, ~16 px, centered, mid-grey.
   - **Single CTA**: `REGISTER ON LUMA →` filled burgundy button, centered, ~24 px below the subtitle.
   - Hairline divider, ~48 px below the CTA.
   - Long description in TNR ~17 px body, line-height ~1.6, generous paragraph spacing. Headings in markdown render as TNR ~24 px (h2) / ~18 px (h3). Lists, links, italics styled to match.
3. **Photos section** (only rendered if `instagramPosts` array is non-empty):
   - Hairline divider above.
   - Heading: `Photos` in TNR, ~22 px, centered.
   - Below: 3-up grid of Instagram blockquote embeds (existing `InstagramGrid.astro` component, restyled to match the brand).
4. Footer.

### 3.4 About (`/about`)

Editorial **prose** layout. Long-form, narrow column, magazine vibe.

1. Header.
2. Body, max-width ~680 px, centered, generous top padding.
   - Page title `About` in TNR, ~48 px, centered, with a small `STUDENT INITIATIVE · GOETHE UNIVERSITY` label above it in sans uppercase, mid-grey.
   - Body content in TNR ~17 px, line-height ~1.6.
   - Markdown headings (`##`, `###`) styled in TNR with hierarchical sizing (~28 px and ~20 px), with extra top padding to feel sectional.
   - Pull quotes (if used in markdown) styled with a left burgundy bar, larger TNR italic.
   - Lists, links, etc., follow the system rules (links in burgundy with subtle underline).
3. Optional **CTA band at the bottom**: `Become a member →` — large TNR centered, burgundy link/button below, on a `#fafaf6` warm-white background to differentiate from the body.
4. Footer.

### 3.5 Contact (`/contact`)

Simple, editorial, restrained. Centered.

1. Header.
2. Body, max-width ~640 px, centered:
   - Page title `Contact` in TNR, ~48 px, centered.
   - Body markdown (existing content) in TNR.
   - **Primary contact block**:
     - `Email:` in sans uppercase mid-grey label
     - `info@artclub-frankfurt.de` in TNR ~22 px, burgundy link
   - **Instagram block**:
     - `Instagram:` label
     - `@artclub_frankfurt` in TNR, burgundy link to the IG profile
   - **Location block** (if applicable):
     - Address text
     - Optional: a small static map image or link to maps (no embedded map iframe — keeps the page light and on-brand)
3. Footer.

---

## 4. Component & system specifications

### Header (BaseLayout)

The header is the same on every page:
- Wordmark band → hairline → nav band → hairline.
- Wordmark: TNR ~22 px, letter-spacing 1.5 px, primary text color.
- Nav: as specified in §3.1.

**Mobile behavior** (`< 768 px`):
- Wordmark band stays centered.
- Nav collapses into a hamburger button (right-aligned in the wordmark band, replacing the centered layout slightly — wordmark may shift left when hamburger appears).
- Hamburger toggles a vertical list of nav items, separated by hairlines.
- `BECOME A MEMBER` button is the last item in the dropdown, styled the same as on desktop.

### Footer (BaseLayout)

- White background, hairline above, generous vertical padding.
- Left: `© 2026 Art Club Frankfurt` in TNR ~13 px, mid-grey.
- Right: `info@artclub-frankfurt.de` and `Instagram` as separate links, sans small uppercase, mid-grey, burgundy on hover.

### Buttons (system)

Three button types only. No others should be introduced without revisiting this brief.

1. **Primary CTA** — filled burgundy `#690000` background, white text, sans uppercase, letter-spaced, `~11 px / 26 px` padding. Hover: slightly darker burgundy or 90% opacity.
2. **Outline CTA** — burgundy border 1 px, burgundy text on white, sans uppercase, letter-spaced. Hover: filled burgundy.
3. **Text link** — burgundy text, no border, sans uppercase for chrome (`SEE ALL EVENTS →`) or TNR for inline prose links. Underline only on hover for inline prose; chrome links may use a right-arrow `→` instead of underline.

### Section heading pattern

All section headings on the home and events pages share this pattern:
- Optional small label above (sans uppercase, mid-grey, ~10 px, letter-spacing ~3 px).
- Heading in TNR, sized per section.
- Optional accent link to the right (burgundy, sans, small).

### Instagram section (modularity requirement)

The home page IG section must be **modular** so the underlying source can be swapped from behold to a curated set without code refactoring elsewhere on the site.

**Architecture:**

- `src/components/InstagramSection.astro` — the section wrapper. Renders the section heading (`Latest from Instagram`), the right-aligned profile link, and dispatches to one of the source-specific renderers based on a config key.
- `src/components/InstagramSectionBehold.astro` — renders the behold widget (`<div data-behold-id="...">` + `<script>`).
- `src/components/InstagramSectionCurated.astro` — renders a uniform 4-up grid of Instagram blockquote embeds, given a list of post URLs. Same visual rules as `InstagramGrid.astro` but for the home page section. Sharp corners, tight gaps.

**Site config (`src/data/site.json`)** gets a new `instagram` block:
```json
{
  "instagram": {
    "source": "behold",
    "beholdWidgetId": "0NpO39PsREMoYX8tp042",
    "curatedPosts": []
  }
}
```

To switch from behold to curated, the editor changes `"source": "behold"` to `"source": "curated"` and populates `"curatedPosts"` with 4 post URLs. No other change needed. Validation enforces that the matching field is populated.

**Visual rules (apply to both implementations):**
- 4 uniform square thumbnails on desktop, 2-up on mobile.
- Sharp corners (or radius ≤ 4 px to match the rest of the site).
- Tight gaps (~12 px).
- Section heading in TNR, accent link in burgundy sans (rendered by `InstagramSection.astro`, never by the source-specific component — that way both sources get the same chrome).
- The behold variant uses behold's "Grid" / uniform template (NOT the bouncy default).
- If behold's template can't deliver a sharp uniform grid, a small CSS override layer in `src/styles/behold.css` enforces the desired look; this is allowed but should be minimal and well-commented.

### Per-event Instagram grid (`InstagramGrid.astro`)

Existing component. Visual touch-up only:
- Heading "Photos" in TNR, centered.
- Sharp corners (no rounded radius).
- Tight gaps.
- 3-up on desktop, 2-up on mobile.

---

## 5. Constraints and out of scope

### Confirmed in interview

- **No Goethe University brand restrictions** mentioned by Tsering. (If such restrictions exist — e.g., university requires its logo on student-org websites — they're out of scope for this brief; verify with the university and add as a follow-up if needed.)
- **No animation / motion design.** The site is static, calm, editorial. Hover states are subtle (color shift, underline). No scroll-triggered animations, no parallax, no entrance animations on sections.
- **No dark mode.** White is the canvas; dark mode is an explicit non-goal.
- **No multi-language.** English-only for now (matches the existing content).

### Not specified by this brief (frontend-design's call)

- Exact pixel values for everything (the brief gives ballparks; the implementation will pick precise values that look right at every breakpoint).
- Hover micro-interactions (subtle, on-brand; fine for `frontend-design` to choose).
- Loading / skeleton states (not needed for a static site, but if any client-side fetching is added, it should match the brand).
- Specific image crops or alt text conventions (content-team decision later).

---

## 6. Hand-off to `frontend-design`

After this brief is approved by the user:

1. The next session invokes the `frontend-design` skill with this brief as the primary input.
2. `frontend-design` produces actual component CSS / Astro updates for `BaseLayout.astro`, the home page, and the system pieces (buttons, headings).
3. Page-specific styling for events / about / contact / event-detail follows the same component system and is built out in subsequent steps.
4. All changes go through the standard PR workflow (per README §4.1).

---

## 7. Open questions / deferred decisions

- **Real campus photo for the hero** — needs to be sourced. Until then, a placeholder photo (any moody Frankfurt / Goethe University shot from Unsplash, attribution included if required by license) is acceptable as a stand-in.
- **Behold's available templates** — Tsering will confirm whether behold's free tier offers a sufficiently uniform-grid template; if not, a small CSS override layer is introduced in implementation.
- **Goethe University brand rules** — assumed none, verify externally.
- **Specific Inter weight** for sans elements — implementation chooses; suggested 500/600 for nav/labels, 700 for buttons.
- **Real "Become a member" copy in nav** — keep as is, but consider shortening to `JOIN` on narrow viewports if "Become a member" doesn't fit comfortably.

---

**Approved by:** Tsering (editor / club founder), 2026-05-03, via live interview session.
**Next step:** invoke `frontend-design` skill with this brief as input.
