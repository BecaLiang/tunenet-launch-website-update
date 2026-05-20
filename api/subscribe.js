/**
 * /api/subscribe.js — Resend version (FIXED)
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

  // Use proper environment variable names
  const API_KEY = process.env.RESEND_API_KEY;
  const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

  if (!API_KEY || !AUDIENCE_ID) {
    console.error('[subscribe] Missing RESEND_API_KEY or RESEND_AUDIENCE_ID');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    // Correct Resend API endpoint (audience ID in URL, not body)
    const url = `https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        // firstName and lastName are optional
        unsubscribed: false,
        // Custom properties go here if your audience supports them
        // Note: Resend's contact API currently doesn't accept custom properties via this endpoint
        // So we omit 'properties' for now to avoid errors
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

    const data = await response.json().catch(() => ({}));
    console.log('[subscribe] Success:', data);
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[subscribe] Fetch failed:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
