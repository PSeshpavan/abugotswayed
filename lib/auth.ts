import { google } from 'googleapis';

/**
 * OAuth2 Helper for Personal Account
 *
 * This creates an OAuth2Client using YOUR refresh token (stored in env variables).
 * The client automatically handles access token refresh when needed.
 *
 * All uploads and Drive operations use YOUR credentials, so all files go to YOUR Drive.
 */

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.'
    );
  }

  if (!refreshToken) {
    throw new Error(
      'Missing refresh token. Please run "npm run setup-oauth" to obtain your refresh token, then add GOOGLE_REFRESH_TOKEN to your .env.local file.'
    );
  }

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3001/oauth/callback' // Redirect URI (only used during setup)
  );

  // Set credentials with refresh token
  // The OAuth2Client will automatically refresh the access token when it expires
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}
