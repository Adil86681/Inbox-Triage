// Initiates the Google OAuth2 flow for the Inbox Triage app.
//
// Required Vercel env vars:
//   GOOGLE_CLIENT_ID
//   GOOGLE_CLIENT_SECRET   (used by callback.js, not here)
//
// The redirect URI is computed at request time from the incoming host
// so this file works unchanged across preview deployments, production,
// and custom domains. Just remember to add each of those origins'
// /api/google/callback URLs to the OAuth client's "Authorized redirect
// URIs" in Google Cloud Console.

module.exports = async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID not configured in Vercel environment variables.' });
  }

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirectUri = `${protocol}://${host}/api/google/callback`;

  // Scopes:
  //   gmail.readonly — list/read messages and headers (used by triage)
  //   gmail.modify   — change labels, including removing INBOX (archive button)
  //
  // No calendar scope — the standalone triage app doesn't touch the calendar.
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.redirect(302, authUrl);
};
