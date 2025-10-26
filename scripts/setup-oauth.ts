#!/usr/bin/env node

/**
 * One-Time OAuth Setup Script
 *
 * This script helps you obtain a Google OAuth refresh token for your personal account.
 * Run this ONCE during initial setup to get the refresh token.
 *
 * Usage: npm run setup-oauth
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { google } from 'googleapis';
import * as http from 'http';
import { parse } from 'url';
import open from 'open';

// Load .env.local file explicitly
config({ path: resolve(process.cwd(), '.env.local') });

const PORT = 3001;
const REDIRECT_URI = `http://localhost:${PORT}/oauth/callback`;

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

async function setupOAuth() {
  console.log('\n' + colors.bright + colors.blue + '='.repeat(70) + colors.reset);
  console.log(colors.bright + '  Google OAuth Setup - Wedding Photo App' + colors.reset);
  console.log(colors.blue + '='.repeat(70) + colors.reset + '\n');

  // Check for required environment variables
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(colors.red + '❌ Error: Missing OAuth credentials' + colors.reset);
    console.log('\nPlease set the following in your .env.local file:');
    console.log(colors.yellow + '  GOOGLE_CLIENT_ID=your-client-id' + colors.reset);
    console.log(colors.yellow + '  GOOGLE_CLIENT_SECRET=your-client-secret' + colors.reset);
    console.log('\nSee SETUP_GUIDE_PERSONAL_OAUTH.md for instructions.');
    process.exit(1);
  }

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    REDIRECT_URI
  );

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to get refresh token
    scope: [
      'https://www.googleapis.com/auth/drive.file', // Access to files created by this app
      'https://www.googleapis.com/auth/drive', // Full Drive access (needed to access existing folder)
    ],
    prompt: 'consent', // Force consent screen to get refresh token
  });

  console.log(colors.bright + '📋 Setup Steps:' + colors.reset);
  console.log('1. A browser window will open shortly');
  console.log('2. Sign in with YOUR Google account (the one that owns the Drive folder)');
  console.log('3. Grant the requested permissions');
  console.log('4. You will be redirected back to this script\n');

  console.log(colors.yellow + '⏳ Starting local server on port ' + PORT + '...' + colors.reset);

  // Create local server to handle OAuth callback
  const server = http.createServer(async (req, res) => {
    if (!req.url) return;

    const parsedUrl = parse(req.url, true);

    if (parsedUrl.pathname === '/oauth/callback') {
      const code = parsedUrl.query.code as string;

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Error: No authorization code received</h1>');
        server.close();
        process.exit(1);
      }

      try {
        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`
            <h1>Error: No refresh token received</h1>
            <p>This can happen if you've already authorized this app before.</p>
            <p>Try revoking access at <a href="https://myaccount.google.com/permissions">Google Account Permissions</a> and run this script again.</p>
          `);
          server.close();
          process.exit(1);
        }

        // Success!
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>OAuth Setup Complete</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: #f5f5f5;
              }
              .success {
                background: #d4edda;
                border: 2px solid #28a745;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              h1 { color: #28a745; }
              code {
                background: #fff;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
              }
              .token-box {
                background: #fff;
                padding: 15px;
                border-radius: 5px;
                border: 1px solid #ddd;
                margin: 15px 0;
                word-break: break-all;
                font-family: monospace;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="success">
              <h1>✅ OAuth Setup Complete!</h1>
              <p>Your refresh token has been generated successfully.</p>
              <p><strong>Check your terminal for the next steps.</strong></p>
            </div>
            <p>You can close this window now.</p>
          </body>
          </html>
        `);

        // Display success in terminal
        console.log('\n' + colors.green + colors.bright + '✅ SUCCESS!' + colors.reset);
        console.log(colors.green + 'OAuth authorization complete. Refresh token obtained.\n' + colors.reset);

        console.log(colors.bright + '📝 NEXT STEP:' + colors.reset);
        console.log('Add this line to your .env.local file:\n');

        console.log(colors.bright + colors.blue + '─'.repeat(70) + colors.reset);
        console.log(colors.yellow + `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}` + colors.reset);
        console.log(colors.blue + '─'.repeat(70) + colors.reset + '\n');

        console.log(colors.bright + '📋 Complete .env.local example:' + colors.reset);
        console.log(colors.yellow + `
GOOGLE_CLIENT_ID=${clientId}
GOOGLE_CLIENT_SECRET=${clientSecret}
GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
GOOGLE_DRIVE_FOLDER_ID=10owBvniraOqfEnnDm_HgIBHsm71h3RnL
        `.trim() + colors.reset + '\n');

        console.log(colors.bright + '🚀 After updating .env.local, restart your dev server:' + colors.reset);
        console.log(colors.yellow + '  npm run dev' + colors.reset + '\n');

        console.log(colors.green + '✨ Your app is now ready! Guests can upload without signing in.' + colors.reset);
        console.log(colors.green + '   All photos will be uploaded to YOUR Google Drive.' + colors.reset + '\n');

        server.close();
        process.exit(0);
      } catch (error: any) {
        console.error(colors.red + '\n❌ Error exchanging authorization code:' + colors.reset, error.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Error: ${error.message}</h1>`);
        server.close();
        process.exit(1);
      }
    }
  });

  server.listen(PORT, async () => {
    console.log(colors.green + '✓ Server started' + colors.reset);
    console.log(colors.bright + '\n🌐 Opening browser for OAuth authorization...' + colors.reset + '\n');

    // Wait a moment for the server to be fully ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Open browser
    try {
      await open(authUrl);
      console.log(colors.yellow + 'If the browser doesn\'t open automatically, visit this URL:' + colors.reset);
      console.log(colors.blue + authUrl + colors.reset + '\n');
    } catch (error) {
      console.log(colors.yellow + 'Could not open browser automatically. Please visit this URL:' + colors.reset);
      console.log(colors.blue + authUrl + colors.reset + '\n');
    }
  });

  // Handle server errors
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(colors.red + `\n❌ Error: Port ${PORT} is already in use.` + colors.reset);
      console.log('Please stop any other processes using this port and try again.\n');
    } else {
      console.error(colors.red + '\n❌ Server error:' + colors.reset, error.message);
    }
    process.exit(1);
  });
}

// Run the setup
setupOAuth().catch((error) => {
  console.error(colors.red + '\n❌ Unexpected error:' + colors.reset, error);
  process.exit(1);
});
