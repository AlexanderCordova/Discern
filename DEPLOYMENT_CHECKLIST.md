# Authentication Deployment Checklist

## ☑️ Pre-Deployment Setup

### 1. Get Google OAuth Credentials
- [ ] Go to Google Cloud Console (https://console.cloud.google.com/)
- [ ] Create/select project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
  - [ ] Type: Web application
  - [ ] Authorized origin: `https://www.usediscern.com`
  - [ ] Redirect URI: `https://www.usediscern.com/api/auth/callback/google`
- [ ] Copy Client ID: `_______________________________`
- [ ] Copy Client Secret: `_______________________________`

### 2. Generate NextAuth Secret
- [ ] Run: `openssl rand -base64 32`
- [ ] Copy output: `_______________________________`

---

## ☑️ Vercel Configuration (Frontend)

### Add Environment Variables
Go to: Vercel Dashboard → discern → Settings → Environment Variables

- [ ] Add `NEXTAUTH_URL` = `https://www.usediscern.com`
- [ ] Add `NEXTAUTH_SECRET` = (your generated secret)
- [ ] Add `GOOGLE_CLIENT_ID` = (from Google Cloud)
- [ ] Add `GOOGLE_CLIENT_SECRET` = (from Google Cloud)
- [ ] Add `NEXT_PUBLIC_API_URL` = `https://discern-backend-tnxh.onrender.com`
- [ ] Check "Production", "Preview", and "Development" for all variables

### Deploy
- [ ] Click "Deployments" tab
- [ ] Click "Redeploy" on latest deployment
- [ ] Wait for build to complete (~2-3 min)

---

## ☑️ Render Configuration (Backend)

### Verify Existing Variables
Go to: Render Dashboard → discern-backend → Environment

- [ ] `DATABASE_URL` exists ✓
- [ ] `ANTHROPIC_API_KEY` exists ✓
- [ ] `NODE_ENV` = `production` ✓

### Database Migration (IMPORTANT!)
- [ ] SSH into Render or run locally:
  ```bash
  cd database
  npx prisma migrate dev --name add_auth_models
  ```
- [ ] Verify migration completed successfully

---

## ☑️ Testing Authentication

### Test on Production
- [ ] Go to https://www.usediscern.com
- [ ] Click "Sign In" button in navbar
- [ ] Click "Sign in with Google"
- [ ] Complete Google OAuth flow
- [ ] Verify redirect back to site
- [ ] Verify profile picture appears in navbar
- [ ] Click profile picture → dropdown menu appears
- [ ] Click "My Dashboard" → loads dashboard page
- [ ] Click "Search History" → loads history page
- [ ] Click "Sign Out" → signs out successfully

### Test Dashboard Features
- [ ] Dashboard shows welcome message with your name
- [ ] "Export My Data (CSV)" button is visible
- [ ] Time range selector works
- [ ] Stats display correctly (or "No analyses yet" message)

### Test History Page
- [ ] History page loads
- [ ] Shows past searches (or empty state)
- [ ] Can search/filter history
- [ ] Can view individual analysis details

---

## ☑️ Local Development Setup (Optional)

### Frontend Environment
- [ ] Create `discern/frontend/.env.local`
- [ ] Add all NextAuth variables (see QUICK_ENV_SETUP.md)
- [ ] Add local redirect URI to Google OAuth:
  - `http://localhost:3000/api/auth/callback/google`

### Install Dependencies
- [ ] Fix npm permissions: `sudo chown -R 502:20 "/Users/alex/.npm"`
- [ ] Run: `cd discern/frontend && npm install`
- [ ] Verify next-auth installed successfully

### Database Setup
- [ ] Run migrations: `cd database && npx prisma migrate dev`
- [ ] Generate Prisma client: `npx prisma generate`

### Test Locally
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Go to http://localhost:3000
- [ ] Test sign-in flow locally

---

## ☑️ Common Issues & Fixes

### "Configuration error"
- [ ] Verified all 5 env vars in Vercel?
- [ ] Redeployed after adding variables?
- [ ] Checked for typos in variable names?

### "Redirect URI mismatch"
- [ ] Verified exact match in Google Console?
- [ ] No trailing slash in URI?
- [ ] Using HTTPS (not HTTP) for production?

### "Invalid client"
- [ ] Double-checked Client ID (no spaces)?
- [ ] Double-checked Client Secret (complete copy)?
- [ ] OAuth client type is "Web application"?

### Database errors
- [ ] Ran Prisma migrations?
- [ ] Database connection string correct?
- [ ] Prisma client generated?

### No user data saving
- [ ] Backend routes created for user analytics?
- [ ] Analyze flow updated to link to user?
- [ ] User ID being passed correctly?

---

## 📝 Notes

**Current Status:** Authentication UI complete, backend endpoints needed

**Still to implement:**
1. Backend user analytics endpoints (`/api/user/analytics`, `/api/user/export`, `/api/user/history`)
2. Update analyze flow to associate analyses with logged-in users
3. History page frontend

**Deploy Order:**
1. Backend first (if adding user endpoints)
2. Frontend second (once backend is ready)
3. Test authentication flow
4. Test user-specific features

**Support Resources:**
- NextAuth Docs: https://next-auth.js.org/
- Google OAuth: https://console.cloud.google.com/
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
