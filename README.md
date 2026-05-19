# TuneNet

Pre-launch waitlist website for **TuneNet** — an app for live music.

→ See **`HANDOVER.md`** for full setup and deployment instructions.

## Quick start

```bash
# Deploy to Vercel
git clone <this-repo>
cd tunenet-website
# Push to GitHub, connect to Vercel, set env vars, done.
```

## Project at a glance

- **Static site** + **one serverless function** (waitlist signup → Beehiiv)
- **No build step** — single `index.html` with all CSS/JS inline
- **Privacy-conscious** — cookieless analytics (Plausible), GDPR-friendly cookie banner
- **Three pages routed via URL hash**: home, "who we are", and legal (Privacy / Terms / Cookies)

## What's in the repo

| File / folder | Purpose |
|---|---|
| `index.html` | The website (everything inline) |
| `api/subscribe.js` | Serverless function — proxies signups to Beehiiv |
| `api/README.md` | Function deployment notes |
| `favicon.svg`, `*.png` | Brand favicons + Open Graph share image |
| `manifest.webmanifest` | PWA manifest |
| `TuneNet_*.md` | Canonical source for Privacy / Terms / Cookies (already baked into `index.html`) |
| `HANDOVER.md` | **Full setup guide → read this first** |
| `.env.example` | Required environment variables |

## Required environment variables

Only two — both for the `/api/subscribe` serverless function:

```
BEEHIIV_API_KEY=…          # from Beehiiv → Settings → Integrations → API
BEEHIIV_PUBLICATION_ID=…   # format pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

See `.env.example` and `HANDOVER.md` for details.

## Tech / hosting

- **Hosting**: any static host with optional serverless functions
  (Vercel, Netlify, Cloudflare Pages — recommended in that order)
- **Mailing list**: Beehiiv
- **Analytics**: Plausible (cookieless, consent-gated)
- **Domain**: TBD — currently hardcoded as `tunenet.app` in meta tags;
  search the file for that string to replace

## Company

**TuneNet Limited** (鳴合科技有限公司)
Registered in Hong Kong SAR · Company No. 80298168
Room 13, 7/F, Po Kun Building, 50 Hung To Road, Kwun Tong, Hong Kong
