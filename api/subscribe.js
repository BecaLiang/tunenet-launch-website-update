/**
 * /api/subscribe.js — Resend version
 * Proxies waitlist signup forms to Resend Audiences / Contacts.
 */

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const email = (body.email || '').trim().toLowerCase();
  const source = (body.source || 'website').slice(0, 32);
  const honeypot = body.hp_email;

  // Honeypot anti-spam
  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const API_KEY = process.env.re_CTeAFjH7_CbmQW1VDfghwfdVX511NwkAT;
  const AUDIENCE_ID = process.env.2e6ddd67-04a3-4f4c-9dbd-26bd51e6ced6;

  if (!API_KEY || !AUDIENCE_ID) {
    console.error('[subscribe] Missing RESEND_API_KEY or RESEND_AUDIENCE_ID');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    const response = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        audienceId: AUDIENCE_ID,
        firstName: '',           
        lastName: '',
        unsubscribed: false,
        properties: {
          source: source,
          joined_at: new Date().toISOString(),
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[subscribe] Resend error:', response.status, errorText);

      // Handle duplicate contact gracefully
      if (response.status === 409 || errorText.includes('already exists')) {
        return res.status(200).json({ ok: true, message: "You're already on the waitlist!" });
      }

      return res.status(502).json({ error: 'Subscription service unavailable' });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[subscribe] Fetch failed:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
