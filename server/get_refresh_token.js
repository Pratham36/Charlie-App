import 'dotenv/config';
import { google } from 'googleapis';
import readline from 'readline';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

console.log('\n==================================================================');
console.log('1. Open this URL in your browser to authorize access to Google Drive:\n');
console.log(authUrl);
console.log('==================================================================');
console.log('\n2. After authorizing, copy the "code" query parameter from the browser address bar.');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\n3. Paste the authorization code here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log('\n--- SUCCESS! ---');
    console.log('Copy this refresh token into your server/.env file under GOOGLE_REFRESH_TOKEN:\n');
    console.log(tokens.refresh_token);
    console.log('\n----------------\n');
  } catch (error) {
    console.error('Error retrieving access token:', error.message);
  } finally {
    rl.close();
  }
});
