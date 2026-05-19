# TuneNet website — handover

This is the pre-launch waitlist website for **TuneNet Limited** (鳴合科技有限公司),
a Hong Kong–registered company. It's a single-file site with three modules:

1. A **brand site** (`index.html`) — the marketing landing experience
2. A **serverless function** (`api/subscribe.js`) — proxies waitlist signups to Beehiiv
3. Three **legal pages** (Privacy / Terms / Cookies) — bundled into the same `index.html`, routed via URL hash

The site is built as a single file deliberately. No build step, no framework, no
npm install. Drag the folder onto Vercel/Netlify, set two env vars, and it's live.

---

## File layout

```
project root/
├── index.html              ← website (~292 KB; everything inline)
├── favicon.svg             ← primary favicon (cream dot ●)
├── favicon-32x32.png       ← legacy favicon
├── apple-touch-icon.png    ← iOS home-screen icon (180×180)
├── icon-192.png            ← Android home-screen
├── icon-512.png            ← PWA splash
├── og-image.png            ← share card (1200×630)
├── manifest.webmanifest    ← PWA manifest
│
├── api/
│   ├── subscribe.js        ← serverless function for Beehiiv signup
│   └── README.md           ← function-specific deployment notes
│
├── TuneNet_Privacy_Policy_v1.1.md     ← source for /#privacy page
├── TuneNet_Terms_of_Service_v1.0.md   ← source for /#terms page
├── TuneNet_Cookie_Policy_v1.0.md      ← source for /#cookies page
│
├── README.md               ← project overview (this readme is its companion)
├── HANDOVER.md             ← you are here
├── .env.example            ← env var template
└── .gitignore              ← standard exclusions
```

The legal `.md` files are already baked into `index.html` as legal sections.
Editing them does not change the website — to change the legal text, edit the
corresponding section in `index.html` directly. The `.md` files are kept as
the readable canonical source for legal review.

---

## Quick deploy (Vercel) — 5 minutes

1. **Push the project to a GitHub repo** (private or public).
2. **Sign up at https://vercel.com** (free), or log in.
3. **"Add New" → "Project"** → import the GitHub repo. Vercel auto-detects
   it as a static site with serverless functions. No build settings needed.
4. **Add environment variables** in Vercel → Project → Settings → Environment Variables:
   ```
   BEEHIIV_API_KEY        = <from Beehiiv → Settings → Integrations → API>
   BEEHIIV_PUBLICATION_ID = pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
   Set scope to **Production** (and **Preview** if you want preview deploys to work).
5. **Redeploy** so the env vars take effect.
6. Open the site, type an email into the form, click Join. The button should
   change to "Sending" briefly, then "Saved." Open your Beehiiv subscribers
   dashboard — the email is there.

**Netlify works identically** — see `api/README.md` for the small path change.

---

## What you need to provide before launch

These are the placeholders still in the code. Search the file for the bracket
expressions below and replace.

### 🔴 Required before going live

| What | Where | Notes |
|---|---|---|
| `BEEHIIV_API_KEY` env var | Vercel/Netlify dashboard | From Beehiiv → Settings → Integrations → API. Scope needs `subscriptions:write`. |
| `BEEHIIV_PUBLICATION_ID` env var | Vercel/Netlify dashboard | Format `pub_xxxx-xxxx-…`. Find via Beehiiv API `GET /publications` or in the publication URL. |
| Production domain | `index.html` lines 13, 15, 18, 28 (Open Graph meta tags) | Currently hardcoded as `https://tunenet.app/`. Replace with your real domain everywhere it appears. |
| Plausible domain | `index.html` line ~7593 (`PLAUSIBLE_DOMAIN = 'tunenet.app'`) | Whatever domain you register with Plausible. |
| Plausible account | https://plausible.io | Sign up (~$9/mo for 10k pageviews), add the site, you're done. Script auto-loads on consent. |
| Effective Date in legal docs | All 3 `TuneNet_*.md` files, line 3 | Currently `[TO BE SET ON PUBLICATION]`. Set to the date you publish. Also update inside `index.html` if you re-bundle. |

### 🟡 Nice to have / recommended

| What | Where | Notes |
|---|---|---|
| EU/UK Article 27 Representative | Privacy Policy §9.5 (both .md and index.html) | Required if you're processing EU/UK data and meet the GDPR thresholds. Talk to a privacy lawyer. Until appointed, the current text directs EU/UK users to email hey@tunenet.app. |
| Lawyer review | All 3 legal docs | Cover HK PDPO + US state privacy laws (CCPA/CPRA/VA/CO/CT/UT/TX/FL/OR/MT/DE). |
| Verify "Po Kun Building" | All legal docs | I used a phonetic transliteration of 寶冠大廈. If the building's registered English name is different, swap it in. |
| Verify CR (Company) number 80298168 | All legal docs | The user provided this as the Company No. Hong Kong company numbers are typically 6–8 digits; this is 8 digits. The 80298168 prefix on the BR Certificate often matches the CR number under the One-Stop system, but worth cross-checking against the Certificate of Incorporation. |

---

## Environment variables (full list)

Only the serverless function needs env vars. Static files don't need any.

| Variable | Required | Example | Notes |
|---|---|---|---|
| `BEEHIIV_API_KEY` | yes | `beehiiv_pk_…` | Keep secret; never commit to git. |
| `BEEHIIV_PUBLICATION_ID` | yes | `pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Identifies the publication subscribers go into. |

A template is in `.env.example`.

---

## Testing checklist

After deploying, walk through these to confirm everything works end-to-end:

### Signup form
- [ ] Open `https://your-domain/` — page loads, no console errors
- [ ] Enter a real email in the top "Join" form, click submit
- [ ] Button changes to "Sending", then "Saved"
- [ ] Open Beehiiv → Subscribers → your email is listed
- [ ] (Optional) check inbox for welcome email if you have one configured
- [ ] Repeat for the bottom CTA form (same flow)
- [ ] Try an invalid email (e.g. `foo@bar`) — browser validation should block it

### Legal pages
- [ ] Click footer link "Privacy" — page changes to Privacy Policy
- [ ] URL changes to `#privacy`; the TOC sidebar appears
- [ ] Click each TOC link — page scrolls to the right section
- [ ] Same for "Terms" and "Cookies"
- [ ] Click back to "Home" — returns to landing page, smooth scroll

### Cookie consent
- [ ] First visit: cookie banner appears bottom-left after ~1 second
- [ ] Click "Accept": banner hides; check DevTools → Network → reload — Plausible script loads (`script.js`)
- [ ] Click footer "Manage cookies": banner re-opens
- [ ] Click "Customize": detail panel slides up with toggles
- [ ] Click "Reject": no analytics tags load on reload
- [ ] Visit `#spaceship` page (cream theme): banner still readable (dark on cream)

### Three founder cards
- [ ] Navigate to "Who we are" — see Lisa / Beca / Scott cards
- [ ] Hover each card — body dims slightly; Spotify play bar fades in at bottom
- [ ] The 3 playlists are different (Lisa: caroline-vibes; Beca: hip-hop; Scott: ambient/shoegaze)

### Mobile
- [ ] Open on phone (or DevTools mobile preview)
- [ ] All sections render readably
- [ ] Cards stack vertically
- [ ] Forms work on tap

### Open Graph / share previews
- [ ] Paste your deployed URL into iMessage / Slack / Twitter / Discord
- [ ] Preview shows the OG image (dark cosmic, "An app for live music")
- [ ] If it doesn't, use https://www.opengraph.xyz/ or https://cards-dev.twitter.com/validator to debug

---

## How the site is structured (for the next developer)

`index.html` is single-file but organized. Reading top-to-bottom:

1. **Lines 1–55**: `<head>` — meta tags, favicons, Open Graph, theme color
2. **Lines 56–4100ish**: `<style>` — all CSS as one block, organized by section
   - `:root` CSS variables for the dark theme
   - `body[data-page="spaceship"]` overrides for the cream "Who we are" page
   - Each section has commented headers (Header, Hero, Product, Founders, Closing, Footer, Legal, Cookie banner, etc.)
3. **Lines ~4100–6500**: `<body>` — markup, with one `<section>` per page block, plus three `<section class="legal-page">` for Privacy / Terms / Cookies
4. **Lines ~6500–end**: `<script>` — IIFEs for each feature:
   - `pageRouter` — hash-based routing between home / spaceship / privacy / terms / cookies
   - `forms` — wires both signup forms to `/api/subscribe`
   - `founderSpotify` — lazy-loads Spotify iframes on hover
   - cookie banner logic + consent storage
   - Plausible loader (consent-gated)
   - TOC scroll-spy for legal pages

### Routing model

The site uses **URL hash routing**, not server routing. Every "page" lives in
the same `index.html`. The router shows/hides the relevant section based on
`window.location.hash`:

- `#` or no hash → home (the long marketing scroll)
- `#spaceship` → "Who we are" + founders cards
- `#privacy`, `#terms`, `#cookies` → legal pages
- `#privacy-section-name` → privacy page, scroll-anchored to a section

This means the site needs no server-side rewriting, and works on any static
host (GitHub Pages, Cloudflare Pages, Vercel static, S3, etc.).

### Cookie consent + analytics gating

The cookie banner stores user choice in `localStorage` under the key
`tn_consent`. Other scripts can check `window.tnConsent.has('analytics')` or
`'functional'` before loading anything tracked. Plausible analytics is
currently the only consumer of this.

If you add new tracking (Google Analytics, Meta Pixel, Hotjar, etc.), wire
each loader inside the `applyConsent()` function in the same IIFE that loads
Plausible. The function runs on first load and again whenever the user
updates their preferences.

---

## Editing content after handover

Most copy changes are straightforward text edits in `index.html`:

| To change | Search for | Section |
|---|---|---|
| Hero copy ("An app for live music…") | `An app for live music` | top of `<body>` |
| Founder roles, artists, album, song, live | the founder's name, e.g. `Lisa` or `Beca` | inside the `who-we-are` section |
| Spotify playlist URLs | `data-src="https://open.spotify.com` | three `iframe` blocks inside the founder section |
| Footer email, copyright | `hey@tunenet.app` | bottom `<footer>` |
| Legal text | the section title, e.g. `Information We Collect` | inside the three `<section class="legal-page">` blocks. Mirror the change in the corresponding `.md` for canonical record. |

To add a fourth founder card, copy the entire `<article class="founder-card">`
block (Lisa's or Beca's), update the inner text and Spotify URL, and add a
`reveal delay-4` class to stagger the appear animation.

---

## Things that intentionally don't work yet

- The "app store" badge / download CTA — no app exists yet; the closing CTA
  just collects emails for the waitlist
- The Spotify iframe player will show "Host not in allowlist" when opened
  from `file://` (i.e. double-clicking `index.html` locally). It works fine
  on a real domain.

---

## Questions or issues during setup?

Re-read this doc first. Specifically:
- **Form not working?** → Vercel function logs (Project → Deployments → Functions). Most likely env var not set on Production.
- **Cookie banner doesn't appear?** → Clear localStorage (`localStorage.removeItem('tn_consent')`) and reload.
- **Plausible not tracking?** → Confirm user clicked Accept. Confirm `PLAUSIBLE_DOMAIN` in the JS matches the domain you registered in Plausible.
- **OG image not appearing in social previews?** → Hard-refresh the cache via https://www.opengraph.xyz/ or Twitter card validator. Most platforms cache aggressively.

That should cover most setup snags. Good luck with the launch.
