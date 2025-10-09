# 🔐 Google OAuth Login/Registration Setup Guide

Complete guide to enable "Login with Google" and "Register with Google" functionality.

---

## 📋 Table of Contents

1. [Environment Variables](#environment-variables)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Database Migration](#database-migration)
4. [Testing the Integration](#testing-the-integration)
5. [How It Works](#how-it-works)
6. [Troubleshooting](#troubleshooting)

---

## 🔑 Environment Variables

Add these to your `.env` file:

```bash
# Google OAuth Configuration (Client-Side)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** We only need `NEXT_PUBLIC_GOOGLE_CLIENT_ID` because we're using client-side Google OAuth (popup flow), not server-side redirects. This provides a better user experience!

### **Production Environment Variables:**

For production (e.g., Vercel, Netlify), use your actual domain:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🛠️ Google Cloud Console Setup

### **Step 1: Create a Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Alera Music Platform` (or any name)
4. Click **"Create"**

### **Step 2: Enable Google OAuth**

1. In your project, go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type
3. Click **"Create"**

### **Step 3: Configure OAuth Consent Screen**

Fill in the following:

```
App name: Alera
User support email: your-email@example.com
Developer contact email: your-email@example.com
```

**Scopes:** Add these scopes:

- `userinfo.email`
- `userinfo.profile`
- `openid`

Click **"Save and Continue"**

### **Step 4: Create OAuth Credentials**

1. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
2. Application type: **Web application**
3. Name: `Alera Web Client`

**Authorized JavaScript origins:**

```
http://localhost:3000
https://yourdomain.com
```

**Authorized redirect URIs:** (Not needed for client-side OAuth, but you can leave it empty or add your homepage)

```
http://localhost:3000
https://yourdomain.com
```

4. Click **"Create"**
5. **Copy your Client ID and Client Secret** ✅

### **Step 5: Add to Environment Variables**

Paste the **Client ID** into your `.env` file:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** You don't need the Client Secret for client-side OAuth!

---

## 💾 Database Migration

Run the migration to add OAuth fields to the users table:

```bash
psql "$DATABASE_URL" -f lib/migrations/052_add_oauth_fields.sql
```

**Or using Railway/Vercel Postgres:**

```bash
psql "postgresql://postgres:password@host:port/database" -f lib/migrations/052_add_oauth_fields.sql
```

### **What the migration does:**

- Adds `google_id` column (unique identifier)
- Adds `oauth_provider` column (google, facebook, etc.)
- Adds `oauth_avatar_url` column (profile picture)
- Adds `oauth_name` column (display name)
- Makes `password_hash` nullable (OAuth users don't have passwords)

---

## ✅ Testing the Integration

### **1. Start Development Server**

```bash
npm run dev
```

### **2. Test Login Flow**

1. Navigate to: `http://localhost:3000/auth/login`
2. Click **"Continue with Google"** button
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. Authorize the app
6. You'll be redirected back and logged in! ✨

### **3. Test Registration Flow**

1. Navigate to: `http://localhost:3000/auth/register`
2. Click **"Continue with Google"** button
3. Same flow as login
4. New user account is created automatically

---

## 🔄 How It Works

### **Complete OAuth Flow (Client-Side Popup - Better UX!):**

```
1. User clicks "Continue with Google"
   ↓
2. Google Sign-In SDK loads in browser
   ↓
3. Google popup opens for consent (no page redirect!)
   ↓
4. User authorizes the app
   ↓
5. Popup closes, access token returned to JavaScript
   ↓
6. Frontend fetches user info from Google API
   ↓
7. Frontend sends to backend: POST /api/auth/google/verify
   ↓
8. Backend verifies token with Google
   ↓
9. Backend checks if user exists:

   A) User exists (by google_id):
      → Update profile picture and name
      → Generate JWT token
      → Redirect to dashboard

   B) User exists (by email):
      → Link Google account
      → Set google_id
      → Mark as verified
      → Generate JWT token
      → Redirect to dashboard

   C) New user:
      → Create user account
      → Set google_id, email, name
      → Mark as verified (no password needed)
      → Generate JWT token
      → Return token to frontend
   ↓
10. Frontend logs in user with JWT token
   ↓
11. User redirected to dashboard! 🎉
```

**Benefits of Client-Side OAuth:**

- ✅ No page redirects - better UX
- ✅ Popup window - faster flow
- ✅ Works seamlessly with SPAs
- ✅ User stays on your site

### **What Happens in Database:**

**New Google User:**

```sql
INSERT INTO users (
  email,
  google_id,
  oauth_provider,
  oauth_avatar_url,
  oauth_name,
  artist_name,
  is_verified,
  password_hash  -- NULL for OAuth users
) VALUES (
  'user@gmail.com',
  '108123456789',
  'google',
  'https://lh3.googleusercontent.com/...',
  'John Doe',
  'John Doe',
  TRUE,
  NULL
);
```

**Existing User (link Google):**

```sql
UPDATE users SET
  google_id = '108123456789',
  oauth_provider = 'google',
  oauth_avatar_url = 'https://lh3.googleusercontent.com/...',
  oauth_name = 'John Doe',
  is_verified = TRUE
WHERE email = 'user@gmail.com';
```

---

## 🎨 UI Components

### **Google Button Design:**

The Google button uses the official Google brand colors:

```tsx
<Button onClick={() => (window.location.href = "/api/auth/google")}>
  <GoogleIcon /> {/* Official Google G logo */}
  Continue with Google
</Button>
```

**Features:**

- ✅ Official Google colors (blue, green, yellow, red)
- ✅ Responsive hover effects
- ✅ Clean, modern design
- ✅ Works on both login and register pages

---

## 🐛 Troubleshooting

### **Error: "Google OAuth is not configured"**

**Solution:** Make sure all environment variables are set:

```bash
# Check .env file
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
NEXT_PUBLIC_APP_URL=...
```

**Then restart your dev server:**

```bash
npm run dev
```

---

### **Error: "redirect_uri_mismatch"**

**Problem:** Google doesn't recognize your redirect URI

**Solution:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client
4. Add exact redirect URI:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. Save changes
6. **Wait 5 minutes** for changes to propagate

---

### **Error: "Invalid credentials"**

**Problem:** Wrong Client ID or Secret

**Solution:**

1. Double-check `.env` file
2. Make sure you copied the entire Client ID:
   ```
   GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```
3. Client Secret format:
   ```
   GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
   ```
4. Restart dev server

---

### **Error: "Access blocked: This app's request is invalid"**

**Problem:** OAuth consent screen not configured

**Solution:**

1. Go to **OAuth consent screen**
2. Make sure status is **"In production"** or **"Testing"**
3. Add your email to **Test users** if in testing mode
4. Fill in all required fields

---

### **Users Can't Login (Spinning Forever)**

**Problem:** Callback handler not integrated

**Solution:**

Add `OAuthCallbackHandler` to your dashboard layout:

```tsx
// app/dashboard/layout.tsx
import { OAuthCallbackHandler } from "@/components/auth/oauth-callback-handler";

export default function DashboardLayout({ children }) {
  return (
    <>
      <OAuthCallbackHandler />
      {children}
    </>
  );
}
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` to Git:**

   ```gitignore
   .env
   .env.local
   .env*.local
   ```

2. **Use different credentials for development and production**

3. **Regularly rotate Client Secrets**

4. **Monitor OAuth usage in Google Cloud Console**

5. **Limit OAuth scopes to only what you need:**
   - `openid` - Required
   - `email` - Required for user identification
   - `profile` - Required for name and picture

---

## 📊 Features Implemented

### ✅ **What Works:**

1. **Login with Google** - Existing users can login
2. **Register with Google** - New users auto-registered
3. **Account Linking** - Email-based account linking
4. **Profile Sync** - Avatar and name updated from Google
5. **Auto-Verification** - OAuth users marked as verified
6. **Seamless Redirect** - Return to intended page after login
7. **Beautiful UI** - Official Google branding

### ✅ **User Benefits:**

- **No Password Required** - Passwordless authentication
- **Faster Registration** - One-click signup
- **Secure** - Google handles authentication
- **Auto-Verified** - No email verification needed
- **Profile Picture** - Automatic avatar from Google

---

## 🚀 Going Live (Production)

### **1. Update Environment Variables:**

```bash
# .env.production
GOOGLE_CLIENT_ID=your-prod-client-id
GOOGLE_CLIENT_SECRET=your-prod-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### **2. Update Google Cloud Console:**

Add production URLs to:

- **Authorized JavaScript origins:** `https://yourdomain.com`
- **Authorized redirect URIs:** `https://yourdomain.com/api/auth/google/callback`

### **3. Publish OAuth Consent Screen:**

1. Go to **OAuth consent screen**
2. Click **"Publish App"**
3. Submit for verification (if needed)

### **4. Deploy:**

```bash
vercel --prod
# or
npm run build && npm start
```

---

## 📝 Summary

### **Environment Variables Required:**

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Files Created/Modified:**

- ✅ `lib/migrations/052_add_oauth_fields.sql` - Database schema
- ✅ `lib/google-oauth.ts` - OAuth service
- ✅ `app/api/auth/google/route.ts` - Initiate OAuth
- ✅ `app/api/auth/google/callback/route.ts` - Handle callback
- ✅ `components/auth/login-form.tsx` - Added Google button
- ✅ `components/auth/register-form.tsx` - Added Google button
- ✅ `components/auth/oauth-callback-handler.tsx` - Token handler

---

## 🎉 You're All Set!

Your app now supports Google OAuth login and registration! 🚀

**Next Steps:**

1. Add environment variables
2. Run database migration
3. Test the flow
4. Deploy to production

**Need help?** Check the troubleshooting section above.
