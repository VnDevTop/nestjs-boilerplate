# OIDC Provider Setup Guide

This document provides step-by-step instructions for obtaining the `client_id` and
`client_secret` for each supported OIDC/OAuth2 provider. Set the corresponding
environment variables in your `.env` file after completing each setup.

## Common Environment Variables

All providers use the following environment variable pattern:

```env
OIDC_{PROVIDER}_CLIENT_ID=your-client-id
OIDC_{PROVIDER}_CLIENT_SECRET=your-client-secret
OIDC_{PROVIDER}_CALLBACK_URL=http://localhost:3000/auth/oidc/{provider}/callback  # optional
OIDC_{PROVIDER}_SCOPES=scope1,scope2  # optional, uses defaults
```

Replace `{PROVIDER}` with the provider name (e.g., `GOOGLE`, `MICROSOFT`, etc.)
and `{provider}` with the lowercase name (e.g., `google`, `microsoft`).

---

## Google

### Steps to obtain credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services** → **Credentials**.
4. Click **Create Credentials** → **OAuth client ID**.
5. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for public apps) or **Internal** (for Google Workspace).
   - App name, support email, developer contact info.
   - Scopes: `openid`, `profile`, `email`.
6. Application type: **Web application**.
7. Name: e.g. `nestjs-boilerplate`.
8. **Authorized redirect URIs**: Add your callback URL:
   - Development: `http://localhost:3000/auth/oidc/google/callback`
   - Production: `https://your-domain.com/auth/oidc/google/callback`
9. Click **Create**.
10. Copy the **Client ID** and **Client Secret**.

### Environment variables

```env
OIDC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
OIDC_GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
OIDC_GOOGLE_CALLBACK_URL=http://localhost:3000/auth/oidc/google/callback
OIDC_GOOGLE_SCOPES=openid,profile,email
```

### Notes

- Google provides a full OIDC discovery document at `https://accounts.google.com/.well-known/openid-configuration`.
- The `email_verified` claim is always returned for Google accounts.

---

## Microsoft (Azure AD / Entra ID)

### Steps to obtain credentials

1. Go to [Azure Portal](https://portal.azure.com/).
2. Navigate to **Microsoft Entra ID** (formerly Azure Active Directory).
3. Go to **App registrations** → **New registration**.
4. Name: e.g. `nestjs-boilerplate`.
5. Supported account types:
   - **Accounts in any organizational directory and personal Microsoft accounts** (multi-tenant) — recommended.
   - Or restrict to specific tenants.
6. Redirect URI: **Web** → `http://localhost:3000/auth/oidc/microsoft/callback`.
7. Click **Register**.
8. Copy the **Application (client) ID**.
9. Go to **Certificates & secrets** → **New client secret**.
   - Description: e.g. `nestjs-boilerplate-secret`.
   - Expires: choose an appropriate duration.
   - Click **Add**.
10. Copy the **Value** (not the Secret ID) — this is your client secret.
11. Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated permissions**.
    - Add: `openid`, `profile`, `email`, `User.Read`.
12. Click **Grant admin consent** (if required by your tenant).

### Environment variables

```env
OIDC_MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc
OIDC_MICROSOFT_CLIENT_SECRET=your-client-secret-value
OIDC_MICROSOFT_CALLBACK_URL=http://localhost:3000/auth/oidc/microsoft/callback
OIDC_MICROSOFT_SCOPES=openid,profile,email,User.Read
```

### Notes

- Multi-tenant (common endpoint) supports both personal and work/school accounts.
- For single-tenant, replace `common` in URLs with your tenant ID.
- Microsoft Graph `/me` endpoint returns profile data (no picture by default).

---

## GitHub

### Steps to obtain credentials

1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Fill in:
   - **Application name:** e.g. `nestjs-boilerplate`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/auth/oidc/github/callback`
4. Click **Register application**.
5. Copy the **Client ID**.
6. Click **Generate a new client secret**.
7. Copy the **Client Secret** (shown only once).

### Environment variables

```env
OIDC_GITHUB_CLIENT_ID=Iv1.abc123def456
OIDC_GITHUB_CLIENT_SECRET=your-github-client-secret
OIDC_GITHUB_CALLBACK_URL=http://localhost:3000/auth/oidc/github/callback
OIDC_GITHUB_SCOPES=read:user,user:email
```

### Notes

- GitHub is not a full OIDC provider. Email may not be returned if the user's email is private.
- The provider automatically fetches emails from `/user/emails` endpoint when email is missing.
- GitHub does not provide an `email_verified` claim by default.

---

## Apple

### Steps to obtain credentials

1. Go to [Apple Developer Portal](https://developer.apple.com/account/).
2. Navigate to **Certificates, Identifiers & Profiles**.
3. Go to **Identifiers** → click **+** to register a new identifier.
4. Select **Services IDs** → Continue.
5. Description: e.g. `nestjs-boilerplate`.
6. Identifier: e.g. `com.example.nestjs-boilerplate` (must be unique).
7. Enable **Sign in with Apple** → Configure.
8. Primary App ID: select your app (or create one).
9. Website URLs:
   - Domains: `localhost` (dev) or your domain (prod).
   - Return URLs: `http://localhost:3000/auth/oidc/apple/callback`.
10. Save and register.
11. Go to **Keys** → click **+** to create a new key.
12. Key Name: e.g. `nestjs-boilerplate-signin`.
13. Enable **Sign in with Apple** → Configure → select your Primary App ID.
14. Register and download the `.p8` private key file.
15. Note the **Key ID** and **Team ID**.

### Generating the client secret JWT

Apple requires the client secret to be a JWT signed with your private key. Generate it using:

```bash
# Using a tool like https://github.com/patrickbucher/apple-client-secret
# Or manually with Node.js:

node -e "
const jwt = require('jsonwebtoken');
const fs = require('fs');
const privateKey = fs.readFileSync('AuthKey_XXXXXXXXXX.p8', 'utf8');
const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d',
  audience: 'https://appleid.apple.com',
  issuer: 'YOUR_TEAM_ID',
  subject: 'com.example.nestjs-boilerplate',
  keyid: 'YOUR_KEY_ID',
});
console.log(token);
"
```

### Environment variables

```env
OIDC_APPLE_CLIENT_ID=com.example.nestjs-boilerplate
OIDC_APPLE_CLIENT_SECRET=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...  # the JWT above
OIDC_APPLE_CALLBACK_URL=http://localhost:3000/auth/oidc/apple/callback
OIDC_APPLE_SCOPES=openid,name,email
```

### Notes

- Apple only returns the user's name on the **first** authorization. Subsequent logins only return `sub` and `email`.
- Apple does not provide a profile picture.
- The client secret JWT expires (max 6 months). Regenerate before expiry.
- Apple requires HTTPS for production callback URLs.

---

## Facebook

### Steps to obtain credentials

1. Go to [Facebook Developers](https://developers.facebook.com/).
2. Click **My Apps** → **Create App**.
3. Use case: **Authenticate and request data from users with Facebook Login**.
4. App type: **Consumer**.
5. App name: e.g. `nestjs-boilerplate`.
6. Click **Create App**.
7. Go to **Settings** → **Basic**.
   - Copy **App ID** (client ID) and **App Secret** (client secret).
8. Go to **Facebook Login** → **Settings**.
   - Valid OAuth Redirect URIs: `http://localhost:3000/auth/oidc/facebook/callback`
9. Ensure the app is in **Development** mode for testing (switch to Live for production).

### Environment variables

```env
OIDC_FACEBOOK_CLIENT_ID=1234567890123456
OIDC_FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
OIDC_FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/oidc/facebook/callback
OIDC_FACEBOOK_SCOPES=email,public_profile
```

### Notes

- Facebook is not a full OIDC provider. Email may not be returned if the user hasn't granted email permission.
- Facebook's picture URL is nested: `picture.data.url`.
- For production, the app must be reviewed by Facebook for certain permissions.

---

## X (Twitter)

### Steps to obtain credentials

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard).
2. Create a new project and app (or use an existing one).
3. Go to your app's **Settings** → **User authentication settings**.
4. Click **Set up**.
5. App permissions: **Read** (minimum).
6. Type of App: **Web App, Automated App or Bot**.
7. Callback URI / Redirect URL: `http://localhost:3000/auth/oidc/x/callback`
8. Website URL: `http://localhost:3000`
9. Save.
10. Go to **Keys and tokens** tab.
11. Copy **OAuth 2.0 Client ID** and **Client Secret** (generate if needed).

### Environment variables

```env
OIDC_X_CLIENT_ID=your-x-client-id
OIDC_X_CLIENT_SECRET=your-x-client-secret
OIDC_X_CALLBACK_URL=http://localhost:3000/auth/oidc/x/callback
OIDC_X_SCOPES=tweet.read,users.read,offline.access
```

### Notes

- X uses OAuth 2.0 with PKCE (Proof Key for Code Exchange).
- X API v2 returns user data wrapped in a `data` object.
- X does not return email by default (requires additional scopes and elevated access).
- The `offline.access` scope is needed for refresh tokens.

---

## Enabling Multiple Providers

Multiple providers can be active simultaneously. Simply set the environment variables for each provider you want to enable:

```env
# Enable Google and GitHub
OIDC_GOOGLE_CLIENT_ID=...
OIDC_GOOGLE_CLIENT_SECRET=...
OIDC_GITHUB_CLIENT_ID=...
OIDC_GITHUB_CLIENT_SECRET=...
```

The application will automatically register all providers with valid credentials at startup. Check the logs for:

```
Registered 2 OIDC provider(s): GOOGLE, GITHUB
```

## Listing Enabled Providers

You can check which providers are enabled at runtime:

```bash
curl http://localhost:3000/auth/oidc/providers
```

Response:
```json
[
  { "name": "GOOGLE", "enabled": true },
  { "name": "GITHUB", "enabled": true }
]
```

## Initiating OIDC Flow

To start the OIDC flow for a provider:

```
GET /auth/oidc/google
```

This redirects the user to the provider's authorization page. After authentication, the provider redirects back to:

```
GET /auth/oidc/google/callback?code=...&state=...
```

Which returns JWT tokens:

```json
{
  "user": { "sub": "...", "email": "...", "roles": ["USER"] },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```