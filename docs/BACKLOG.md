# Backlog

Prioritized follow-ups for the Art Club Frankfurt website. Pick from the top down.

## Next session

### 🟡 Wire the Instagram carousel via behold.so
- Sign up at <https://app.behold.so/signup> (free, any email)
- Add Instagram → log in as `@artclub_frankfurt` and authorize behold
- Optional but recommended: switch the IG account to **Creator** type first (free, in IG → Settings → Account → "Switch to Professional Account") for a more robust API connection
- Create a widget (Basic Carousel style is fine to start) → copy the widget ID (UUID-shaped, also visible in the embed snippet's `data-behold-id="..."` attribute)
- Paste into `src/data/site.json` → `beholdWidgetId`
- Commit, push → home page goes from "not configured yet" placeholder to live carousel
- Time: ~5-10 min interactive setup, then 30 sec to wire

### 🟡 Deploy to Vercel
- Chosen over Cloudflare Pages because: DNS stays at Strato (Zoho email untouched, zero risk); only adds 2 records at Strato instead of full nameserver migration.
- <https://vercel.com/signup> → "Continue with GitHub" → import `Tseringw/artclub-website` → auto-detects Astro → Deploy.
- After first deploy: project → Settings → Domains → add `artclub-frankfurt.de`. Vercel shows the DNS records to add at Strato:
  - `A` record, name `@`, value `76.76.21.21`
  - `CNAME` record, name `www`, value `cname.vercel-dns.com`
- At Strato: **Domainverwaltung → DNS-Verwaltung →** add those two records. Don't delete or modify any of the Zoho-related records (MX, SPF/TXT, DKIM).
- Wait ~5-10 min for HTTPS to provision.
- Test: `curl -I https://artclub-frankfurt.de` returns 200; send a test email to `info@artclub-frankfurt.de` to confirm Zoho still works.
- Time: ~15 min total.
- Effect: live URL she can open on her phone, plus auto-deploy on every push.

### 🟢 Wire the real Google Form URL
- When the membership form exists, paste its URL into `src/data/site.json` → `googleFormUrl`
- "Become a member" + "Join us" buttons become functional immediately

## Later

### 🔴 Visual design pass
- Invoke the `frontend-design` skill (mentioned in spec §3)
- Brand identity, typography, color, hero treatment, spacing
- All structural code is already in place — this is presentation-only

### 🟠 Real event content
- Replace `2026-06-15-spring-gala.md` and `2026-03-10-welcome-night.md` in `src/content/events/` with actual events
- Editor template + workflow: README §6 ("Add a new event")

### 🟠 Real content writing
- `src/content/site/home.md` — hero paragraph
- `src/content/site/about.md` — mission, team, what the club does
- `src/content/site/contact.md` — location, additional contact channels

### 🟢 SEO + Open Graph
- Add `description` to each page via `BaseLayout` props
- Generate per-page Open Graph images (better preview cards in WhatsApp/IG DMs)
- Tools: `@astrojs/sitemap` (sitemap.xml), build-time OG image generation

### 🟢 Analytics (optional, later)
- Vercel Web Analytics is privacy-friendly + free tier + one-line addition (`@vercel/analytics` in the BaseLayout). Or Plausible / Cloudflare Web Analytics as alternatives.
- No cookie banner needed (no PII).

## Done so far

- ✅ Astro 6 + Tailwind v4 scaffold, all deps strictly pinned, `.npmrc` enforces save-exact
- ✅ Content collections (events + site pages) with Zod-validated schemas
- ✅ All 5 page routes (Home, Events index, Event detail, About, Contact)
- ✅ Responsive nav with hamburger menu on mobile (< 768px)
- ✅ "Become a member" CTA in nav, linking to Google Form (placeholder URL)
- ✅ behold.so widget hooked up in code (waiting on widget ID)
- ✅ Per-event Instagram photo grid component
- ✅ Site config wired with real values: name "Art Club Frankfurt", tagline, email, IG handle, custom domain
- ✅ Pushed to <https://github.com/Tseringw/artclub-website>
- ✅ Comprehensive README + spec + implementation plan in `docs/`
