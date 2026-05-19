/**
 * /api/subscribe.js — serverless function that proxies signup-form
 * submissions to Beehiiv's API.
 *
 * Why this exists:
 *   The browser POSTs the email to this function (same origin, no CORS).
 *   This function uses the secret BEEHIIV_API_KEY to call Beehiiv. The key
 *   never reaches the browser, so it can't be stolen by viewing the page
 *   source.
 *
 * Deployment (Vercel):
 *   1. Put this file at /api/subscribe.js in your project root.
 *   2. Deploy to Vercel (or `vercel` CLI). Vercel auto-detects /api/* and
 *      hosts it as a Node.js serverless function.
 *   3. In the Vercel dashboard → Settings → Environment Variables, add:
 *        BEEHIIV_API_KEY        (from Beehiiv Settings → Integrations → API)
 *        BEEHIIV_PUBLICATION_ID (looks like "pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
 *   4. Redeploy so the env vars take effect.
 *
 * Deployment (Netlify):
 *   Move this file to /netlify/functions/subscribe.js, and either add a
 *   redirect in netlify.toml so /api/subscribe → /.netlify/functions/subscribe,
 *   or change ENDPOINT in index.html's forms() to '/.netlify/functions/subscribe'.
 *   Add the same env vars in Netlify → Site → Build & deploy → Environment.
 *
 * Local testing:
 *   `vercel dev`  (Vercel CLI) — runs the function at http://localhost:3000/api/subscribe
 *   `netlify dev` (Netlify CLI) — equivalent
 *
 * Anti-spam:
 *   The HTML form has a hidden honeypot input named "hp_email". Bots fill
 *   every input; humans never see this one. The client-side JS short-circuits
 *   when it's populated, but we also guard server-side as a defense in depth.
 */

module.exports = async function handler(req, res) {
  // Only POST is allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body — Vercel parses JSON automatically; other platforms may not
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const email = (body.email || '').trim().toLowerCase();
  const source = (body.source || 'website').slice(0, 32);
  const honeypot = body.hp_email;

  // Honeypot tripped — return success to confuse the bot, but don't subscribe
  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  // Basic email shape check (server-side defense; client already validates)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const API_KEY = process.env.BEEHIIV_API_KEY;
  const PUB_ID  = process.env.BEEHIIV_PUBLICATION_ID;

  if (!API_KEY || !PUB_ID) {
    console.error('[subscribe] missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID env var');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    const beehiivRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${encodeURIComponent(PUB_ID)}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: 'tunenet.app',
          utm_medium: 'organic',
          utm_campaign: source,
        }),
      }
    );

    if (!beehiivRes.ok) {
      const text = await beehiivRes.text().catch(() => '');
      console.error('[subscribe] beehiiv error', beehiivRes.status, text);
      // Beehiiv returned an error. Don't leak its message to the public;
      // a generic 502 is enough for the client to show "try again".
      return res.status(502).json({ error: 'Subscription service unavailable' });
    }

    const data = await beehiivRes.json().catch(() => ({}));
    return res.status(200).json({ ok: true, id: data?.data?.id });
  } catch (err) {
    console.error('[subscribe] fetch failed', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
