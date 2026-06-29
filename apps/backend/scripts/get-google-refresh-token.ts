/**
 * One-time helper to obtain a Google OAuth2 refresh token for the account that
 * will create Google Meet events (the "organizer").
 *
 * Prerequisites (Google Cloud Console → APIs & Services):
 *   1. Enable the "Google Calendar API".
 *   2. Configure the OAuth consent screen (External). Add your Google account as
 *      a "Test user" while the app is in testing mode.
 *   3. Create an OAuth client ID of type "Web application" and add this redirect
 *      URI:  http://localhost:5555/oauth2callback
 *   4. Put the resulting credentials in apps/backend/.env:
 *        GOOGLE_CLIENT_ID="..."
 *        GOOGLE_CLIENT_SECRET="..."
 *
 * Then run:  pnpm --filter @reviewsphere/backend google:token
 * Open the printed URL, sign in with the organizer account, approve calendar
 * access, and the refresh token will be printed here. Paste it into .env as
 * GOOGLE_REFRESH_TOKEN.
 */
import 'dotenv/config';
import http from 'node:http';
import { google } from 'googleapis';

const PORT = 5555;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function main() {
  const clientId = process.env['GOOGLE_CLIENT_ID'];
  const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];

  if (!clientId || !clientSecret) {
    console.error(
      'Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in apps/backend/.env.\n' +
        'Create an OAuth client (Web application) in Google Cloud Console first.'
    );
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });

  const server = http.createServer(async (req, res) => {
    if (!req.url || !req.url.startsWith('/oauth2callback')) {
      res.writeHead(404).end();
      return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const code = url.searchParams.get('code');
    if (!code) {
      res.writeHead(400).end('Missing authorization code.');
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h2>Success! You can close this tab and return to the terminal.</h2>');

      console.log('\n==================== COPY THIS ====================');
      if (tokens.refresh_token) {
        console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
      } else {
        console.log(
          'No refresh token returned. Revoke prior access at ' +
            'https://myaccount.google.com/permissions and run again with a fresh consent.'
        );
      }
      console.log('===================================================\n');
    } catch (err) {
      const e = err as { message?: string };
      console.error('Failed to exchange code for tokens:', e?.message ?? err);
      res.writeHead(500).end('Token exchange failed. Check the terminal.');
    } finally {
      server.close();
      setTimeout(() => process.exit(0), 250);
    }
  });

  server.listen(PORT, () => {
    console.log('\nOpen this URL in your browser and approve access:\n');
    console.log(authUrl + '\n');
    console.log(`Waiting for the redirect on ${REDIRECT_URI} ...`);
  });
}

main();
