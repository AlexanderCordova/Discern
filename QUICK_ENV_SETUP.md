# Quick Environment Variables Setup

## Step 1: Generate NEXTAUTH_SECRET

Run this command:
```bash
openssl rand -base64 32
```

Copy the output - you'll use it in both Vercel and locally.

---

## Step 2: Set up Google OAuth

1. Go to: https://console.cloud.google.com/
2. Create/select project
3. Enable "Google+ API" (APIs & Services > Library)
4. Create OAuth credentials (APIs & Services > Credentials > Create Credentials)
   - Type: **Web application**
   - Authorized origins: `https://www.usediscern.com`
   - Redirect URIs: `https://www.usediscern.com/api/auth/callback/google`
5. Copy **Client ID** and **Client Secret**

---

## Step 3: Add to Vercel (Frontend)

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these **6 variables** (one at a time):

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `NEXTAUTH_URL` | `https://www.usediscern.com` | ✅ All |
| `NEXTAUTH_SECRET` | (from Step 1) | ✅ All |
| `GOOGLE_CLIENT_ID` | (from Step 2) | ✅ All |
| `GOOGLE_CLIENT_SECRET` | (from Step 2) | ✅ All |
| `NEXT_PUBLIC_API_URL` | `https://discern-backend-tnxh.onrender.com` | ✅ All |

**Then redeploy your app!**

---

## Step 4: Verify Render (Backend)

Go to: https://dashboard.render.com/ → Your Service → Environment

Make sure these exist:
- ✅ `DATABASE_URL`
- ✅ `ANTHROPIC_API_KEY`
- ✅ `NODE_ENV=production`

No changes needed unless missing!

---

## Step 5: Local Development (Optional)

Create `discern/frontend/.env.local`:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=(same as Step 1)
GOOGLE_CLIENT_ID=(same as Step 2)
GOOGLE_CLIENT_SECRET=(same as Step 2)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Important**: You also need to add `http://localhost:3000/api/auth/callback/google` to your Google OAuth redirect URIs for local testing!

---

## Step 6: Test It!

1. Go to https://www.usediscern.com
2. Click "Sign In" in navbar
3. Sign in with Google
4. Should see your profile picture in navbar ✨

---

## Troubleshooting

**"Configuration error"**
- Make sure you saved all 5-6 variables in Vercel
- Redeploy your app after adding variables

**"Redirect URI mismatch"**
- Go back to Google Cloud Console
- Make sure redirect URI is exactly: `https://www.usediscern.com/api/auth/callback/google`
- No trailing slash!

**"Invalid client"**
- Double-check your Client ID and Secret
- Make sure you copied them completely (no spaces)

---

## Apple Sign In (Optional - Skip for Now)

Apple OAuth is more complex. You can add it later if needed. For now, Google sign-in is sufficient!
