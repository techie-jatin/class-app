# Trading Academy — Deployment Guide

**Stack:** GitHub (source) → Vercel (frontend) + Railway (backend) + Supabase (database) + Firebase (auth)

> This guide walks you through every step. Follow them in order.

---

## Table of Contents

1. [Prepare GitHub Repository](#1-prepare-github-repository)
2. [Set Up Supabase (Database)](#2-set-up-supabase-database)
3. [Set Up Firebase (Auth)](#3-set-up-firebase-auth)
4. [Deploy Backend on Railway](#4-deploy-backend-on-railway)
5. [Deploy Frontend on Vercel](#5-deploy-frontend-on-vercel)
6. [Secret Keys — Where They Live](#6-secret-keys--where-they-live)
7. [Environment Variables Reference](#7-environment-variables-reference)

---

## 1. Prepare GitHub Repository

### 1a. Make sure `.gitignore` covers secrets

Your `.gitignore` already ignores `node_modules` and `.local/`. Confirm these lines exist (add them if not):

```
.env
.env.*
*.env
```

**Never commit a `.env` file. All secrets go into Railway / Vercel dashboards — never into the code.**

### 1b. Push code to GitHub

```bash
# In your project root (do this from your local machine or Replit shell)
git init                          # skip if already a git repo
git remote add origin https://github.com/YOUR_USERNAME/trading-academy.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

> Your Replit project is already a git repo. You can push it directly from the Replit shell.

---

## 2. Set Up Supabase (Database)

Supabase gives you a free PostgreSQL database with a connection string you plug into Railway.

### 2a. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g., `trading-academy`) and a strong database password — **save this password somewhere safe**
3. Choose the region closest to you
4. Wait ~2 minutes for the project to provision

### 2b. Get your connection string

1. In your Supabase project → **Project Settings** (gear icon) → **Database**
2. Scroll to **Connection string** → choose **URI** tab
3. Copy the string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with the password you set in step 2a

> **This is your `DATABASE_URL` secret.** You will paste it into Railway later — never into any file.

### 2c. Run the database schema

After Railway is set up (step 4), you'll run the migrations. But you can also run them now from your local machine:

```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxx.supabase.co:5432/postgres" \
  pnpm --filter @workspace/db run push
```

---

## 3. Set Up Firebase (Auth)

Firebase Auth replaces the current JWT email/password system. Here's what needs to happen technically, then the setup steps.

### What changes with Firebase Auth

| Current (JWT) | Firebase Auth |
|---|---|
| `POST /api/auth/login` verifies password | Firebase SDK verifies password on the **frontend** |
| Backend issues a JWT | Firebase issues an **ID token** |
| `Authorization: Bearer <jwt>` | `Authorization: Bearer <firebase-id-token>` |
| `requireAuth` middleware decodes your JWT | `requireAuth` middleware verifies the Firebase ID token |

> The backend still handles roles, course access, and all data — Firebase only handles "who is this person."

### 3a. Create a Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Name it `trading-academy` → disable Google Analytics (optional) → **Create project**

### 3b. Enable Email/Password auth

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click **Email/Password** → toggle **Enable** → Save

### 3c. Get Frontend config (public — safe to expose)

1. Firebase Console → Project Settings (gear) → **General** → scroll to **Your apps**
2. Click **Add app** → Web (`</>`)
3. Register app name → Copy the config object:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

These values go into **Vercel environment variables** as `VITE_` prefixed keys (see step 5).

### 3d. Get Service Account key (private — never expose)

1. Firebase Console → Project Settings → **Service accounts** tab
2. Click **Generate new private key** → **Generate key**
3. A JSON file downloads — **do not commit this file**
4. Open it and copy these two values:
   - `"client_email"`: e.g., `firebase-adminsdk-xxxxx@your-app.iam.gserviceaccount.com`
   - `"private_key"`: a long string starting with `-----BEGIN RSA PRIVATE KEY-----`

These go into **Railway environment variables** as `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`.

### 3e. Code changes needed (Firebase Auth integration)

After setup, these files in the codebase need updating:

**Backend — `artifacts/api-server/src/middlewares/auth.ts`:**
- Install `firebase-admin`: `pnpm --filter @workspace/api-server add firebase-admin`
- Replace JWT verification with Firebase Admin SDK token verification:

```ts
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    // Look up user in your DB by email
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.email, decoded.email)).limit(1);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
```

**Frontend — `artifacts/trading-academy/src/hooks/useAuth.ts`:**
- Replace `useLogin` mutation with Firebase `signInWithEmailAndPassword`
- Store the Firebase ID token (call `user.getIdToken()`) in localStorage as `ta_token`
- On logout, call `signOut(auth)` from Firebase SDK

**Frontend — `lib/api-client-react/src/custom-fetch.ts`:**
- No change needed — it already reads `ta_token` from localStorage. Just store the Firebase ID token there instead.

---

## 4. Deploy Backend on Railway

Railway runs your Express API server.

### 4a. Create a Railway account

1. Go to [https://railway.app](https://railway.app) → Sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `trading-academy` repo

### 4b. Configure the service

1. Railway detects it's a Node project. Set the **Start command**:
   ```
   pnpm --filter @workspace/api-server run start
   ```
2. Set **Build command**:
   ```
   pnpm install && pnpm --filter @workspace/api-server run build
   ```
3. Set **Root directory**: leave blank (uses repo root)

### 4c. Add environment variables (secrets) in Railway

Go to your service → **Variables** tab → add each one:

| Variable | Value | Where to get it |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:...@db.xxx.supabase.co:5432/postgres` | Supabase → Settings → Database |
| `SESSION_SECRET` | Any long random string (32+ chars) | Make one up, e.g. `openssl rand -hex 32` |
| `FIREBASE_PROJECT_ID` | `your-app` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-...@your-app.iam.gserviceaccount.com` | Service account JSON |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN RSA PRIVATE KEY-----\n...` | Service account JSON |
| `PORT` | `8080` | Fixed |
| `NODE_ENV` | `production` | Fixed |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Set after Vercel deploy |

> **FIREBASE_PRIVATE_KEY tip:** In the service account JSON, the key has literal `\n` characters. In Railway, paste the key exactly as-is from the JSON file — Railway handles the newlines correctly.

### 4d. Push DB schema to Supabase

After adding `DATABASE_URL` to Railway, run the schema push once from Railway's terminal, or from your local machine:

```bash
DATABASE_URL="your-supabase-url" pnpm --filter @workspace/db run push
```

### 4e. Get your Railway backend URL

Once deployed, Railway gives you a URL like `https://trading-academy-production.up.railway.app`. Save this — you'll need it for Vercel.

---

## 5. Deploy Frontend on Vercel

Vercel hosts the React/Vite frontend.

### 5a. Create a Vercel account

1. Go to [https://vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New Project** → Import your `trading-academy` repo

### 5b. Configure the build

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `artifacts/trading-academy` |
| **Build Command** | `pnpm run build` |
| **Output Directory** | `dist/public` |
| **Install Command** | `cd ../.. && pnpm install` |

### 5c. Add environment variables in Vercel

Go to **Settings** → **Environment Variables** → add each one:

| Variable | Value | Where to get it |
|---|---|---|
| `VITE_API_URL` | `https://trading-academy-production.up.railway.app/api` | Railway URL from step 4e |
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` | Firebase web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-app.firebaseapp.com` | Firebase web app config |
| `VITE_FIREBASE_PROJECT_ID` | `your-app` | Firebase web app config |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-app.appspot.com` | Firebase web app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Firebase web app config |
| `VITE_FIREBASE_APP_ID` | `1:123456789:web:abc123` | Firebase web app config |

> `VITE_` prefixed variables are bundled into the frontend build. They are visible in the browser — that is normal and safe for Firebase config. Never put backend secrets (DATABASE_URL, FIREBASE_PRIVATE_KEY) as VITE_ variables.

### 5d. Deploy

Click **Deploy**. Vercel builds and deploys automatically. Every `git push` to `main` triggers a new deploy.

---

## 6. Secret Keys — Where They Live

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECRET LOCATIONS                         │
├──────────────────────┬──────────────────────────────────────────┤
│ DATABASE_URL         │ Railway → Variables                      │
│ SESSION_SECRET       │ Railway → Variables                      │
│ FIREBASE_PROJECT_ID  │ Railway → Variables                      │
│ FIREBASE_CLIENT_EMAIL│ Railway → Variables                      │
│ FIREBASE_PRIVATE_KEY │ Railway → Variables                      │
├──────────────────────┼──────────────────────────────────────────┤
│ VITE_FIREBASE_*      │ Vercel → Environment Variables           │
│ VITE_API_URL         │ Vercel → Environment Variables           │
├──────────────────────┼──────────────────────────────────────────┤
│ Service account .json│ DELETE after copying values — never      │
│                      │ commit this file                         │
└──────────────────────┴──────────────────────────────────────────┘
```

**GitHub contains:** only code. No `.env` files. No API keys. No passwords.

**If you accidentally commit a secret:**
1. Immediately rotate/regenerate that key (in Firebase / Supabase / Railway)
2. Remove it from git history: `git filter-branch` or use [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
3. Force push the cleaned history

---

## 7. Environment Variables Reference

### Backend (Railway)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Random secret string (legacy, keep for now) |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Firebase service account private key |
| `PORT` | ✅ | `8080` |
| `NODE_ENV` | ✅ | `production` |
| `FRONTEND_URL` | Recommended | Your Vercel URL (for CORS) |

### Frontend (Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Full Railway backend URL + `/api` |
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |

---

## Order of Operations (Quick Reference)

```
1. Create Supabase project → copy DATABASE_URL
2. Create Firebase project → enable Email/Password auth
3. Get Firebase web config → save VITE_FIREBASE_* values
4. Generate Firebase service account key → save FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
5. Push code to GitHub
6. Create Railway project → add all backend env vars → deploy
7. Run: pnpm --filter @workspace/db run push (against Supabase)
8. Create Vercel project → add all frontend env vars → deploy
9. Update FRONTEND_URL in Railway to match your Vercel URL
10. Implement Firebase Auth code changes (see Section 3e)
```

---

*Generated for Trading Academy — June 2026*
