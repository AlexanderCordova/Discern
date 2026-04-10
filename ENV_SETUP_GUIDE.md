# Environment Variables Setup Guide

## Frontend (Vercel)

Add these environment variables in your Vercel project settings:

### Authentication (NextAuth)
```bash
# NextAuth Configuration
NEXTAUTH_URL=https://www.usediscern.com
NEXTAUTH_SECRET=<generate-a-random-secret-here>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Apple OAuth (Optional - can add later)
APPLE_CLIENT_ID=<your-apple-client-id>
APPLE_CLIENT_SECRET=<your-apple-client-secret>

# Backend API URL
NEXT_PUBLIC_API_URL=https://discern-backend-tnxh.onrender.com
```

### How to Get Google OAuth Credentials:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing)
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins:
     - `https://www.usediscern.com`
     - `http://localhost:3000` (for local testing)
   - Authorized redirect URIs:
     - `https://www.usediscern.com/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (for local testing)
5. **Copy the Client ID and Client Secret**

### How to Get Apple OAuth Credentials (OPTIONAL):

1. **Go to Apple Developer**: https://developer.apple.com/account/
2. **Create an App ID**:
   - Identifiers > App IDs > Register a New Identifier
   - Enable "Sign in with Apple"
3. **Create a Service ID**:
   - Identifiers > Services IDs > Register
   - Configure "Sign in with Apple"
   - Add domain: `usediscern.com`
   - Add return URL: `https://www.usediscern.com/api/auth/callback/apple`
4. **Create a Key**:
   - Keys > Register a new key
   - Enable "Sign in with Apple"
   - Download the .p8 key file
5. **Use the Service ID as APPLE_CLIENT_ID**
6. **Generate APPLE_CLIENT_SECRET** using the key (complex - see NextAuth docs)

### Generate NEXTAUTH_SECRET:

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Or use this online: https://generate-secret.vercel.app/32

---

## Backend (Render)

Your backend environment variables should already be set in Render, but verify these exist:

```bash
# Database
DATABASE_URL=<your-postgres-connection-string>

# Anthropic API
ANTHROPIC_API_KEY=<your-anthropic-api-key>

# Optional: Admin password (if you re-enable admin features later)
ADMIN_PASSWORD=<some-secure-password>

# Node Environment
NODE_ENV=production
```

---

## Local Development (.env.local files)

### Frontend: `discern/frontend/.env.local`
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-generated-secret>

GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Optional Apple OAuth
APPLE_CLIENT_ID=<your-apple-client-id>
APPLE_CLIENT_SECRET=<your-apple-client-secret>

# Point to local backend for development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend: `discern/backend/.env`
(This should already exist, but verify it has):
```bash
DATABASE_URL=<your-local-or-remote-postgres-url>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
ADMIN_PASSWORD=<optional>
PORT=3001
NODE_ENV=development
```

---

## Where to Add in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your "discern" project
3. Go to "Settings" > "Environment Variables"
4. Add each variable:
   - Variable name: `NEXTAUTH_URL`
   - Value: `https://www.usediscern.com`
   - Environment: Check "Production", "Preview", and "Development"
   - Click "Save"
5. Repeat for all frontend variables
6. **Redeploy** your app after adding variables

---

## Where to Add in Render:

1. Go to https://dashboard.render.com/
2. Select your backend service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. The database URL should already be there
6. Verify ANTHROPIC_API_KEY exists
7. Save changes (will trigger auto-redeploy)

---

## Testing Authentication:

After adding environment variables:

1. **Redeploy both frontend and backend**
2. Go to `https://www.usediscern.com`
3. Click "Sign In" button in navbar
4. Should redirect to NextAuth sign-in page
5. Click "Sign in with Google"
6. Complete Google OAuth flow
7. Should redirect back to your site, logged in
8. Your profile picture should appear in navbar

---

## Troubleshooting:

### "Configuration error" on sign-in page
- Check that all NEXTAUTH variables are set in Vercel
- Verify NEXTAUTH_URL matches your actual domain
- Make sure you redeployed after adding variables

### "Redirect URI mismatch" error from Google
- Go back to Google Cloud Console
- Verify redirect URI exactly matches: `https://www.usediscern.com/api/auth/callback/google`
- Note: no trailing slash

### "Invalid client" error
- Double-check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Make sure you copied them correctly (no extra spaces)
- Verify the OAuth client is for "Web application" type

### Database connection errors
- You'll need to run database migrations after setting up
- See MIGRATION_GUIDE.md for instructions
