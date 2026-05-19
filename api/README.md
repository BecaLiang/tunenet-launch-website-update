# TuneNet — wiring the signup form to Beehiiv

The site collects waitlist emails from two signup forms (top hero + bottom CTA).
Both POST to `/api/subscribe`, a serverless function that proxies to Beehiiv
using a private API key.

## Why a proxy?

Beehiiv's API requires a Bearer auth token. If we put that token in
client-side JavaScript, anyone could view the page source and steal it,
then add/remove subscribers on your account. The serverless function keeps
the key on the server.

## File layout

```
your-project/
├── index.html              ← the website (what visitors see)
└── api/
    └── subscribe.js        ← serverless function (this proxy)
```

## Quick deploy on Vercel (recommended — free, 5 minutes)

1. **Create a Vercel account** at https://vercel.com (free).
2. **Push the project to GitHub** (or any git host Vercel supports).
3. **Import the project** into Vercel → "Add New" → "Project" → select your repo.
4. **Add environment variables** in Vercel → Project → Settings → Environment Variables:
   - `BEEHIIV_API_KEY` — get from Beehiiv → Settings → Integrations → API
   - `BEEHIIV_PUBLICATION_ID` — format `pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
     visible in your Beehiiv dashboard URL or via the API
5. **Redeploy** so the env vars take effect.
6. Visit your site. Forms now work end-to-end.

## Where to find your Beehiiv credentials

**API key:**
1. Log in to Beehiiv
2. Settings → Integrations → API
3. Create a new key (give it a name like "tunenet-website")
4. Copy the key — you won't see it again
5. Required scope: `subscriptions:write`

**Publication ID:**
1. Log in to Beehiiv
2. The URL after `/dashboard/` is your publication ID, *or*
3. Hit `GET https://api.beehiiv.com/v2/publications` with your API key
   and you'll see `id: "pub_xxx"` in the response

## Testing it works

After deploying:
1. Open the deployed site
2. Type a real email into the top form, click "Join"
3. Button should change to "Sending" briefly, then "Saved"
4. Check Beehiiv → Subscribers — your email should appear
5. Check your inbox — you should receive the welcome email (if you enabled
   "send_welcome_email" in your Beehiiv publication settings)

If the button reverts to "Join" with a "Couldn't reach the list" message,
check the Vercel function logs (Vercel → Project → Deployments → Functions)
for the actual error. Most common causes:
- Env vars not set, or not pushed to the right environment (Production vs Preview)
- API key revoked or doesn't have `subscriptions:write` scope
- Publication ID typo

## Netlify alternative

If you'd rather use Netlify:
1. Move `/api/subscribe.js` to `/netlify/functions/subscribe.js`
2. Add a `netlify.toml` at the project root:
   ```toml
   [[redirects]]
     from = "/api/subscribe"
     to   = "/.netlify/functions/subscribe"
     status = 200
   ```
3. Add the same env vars in Netlify → Site → Settings → Environment.

The client code doesn't change.

## Anti-spam

The HTML form contains a hidden "honeypot" input (`name="hp_email"`).
Bots that fill every input get caught — both the client JS and the server
function short-circuit when it's populated, returning a fake-success
response so the bot doesn't retry. Humans never see the field.

## Going from preview to launch

Beehiiv publications have a "double opt-in" setting in their dashboard.
With it enabled, users get a confirmation email and must click a link
before they're truly subscribed. Recommended for launching to a wider
audience (deliverability protection). For an internal launch you can
leave it off and use the "send_welcome_email: true" we already pass.
