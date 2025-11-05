# 🚀 Complete Deployment Guide

## Overview
This guide will walk you through deploying the AI Resume platform to production using Vercel for hosting and GitHub for version control.

**Estimated Time:** 30-45 minutes

---

## Prerequisites

Before starting, ensure you have:
- ✅ GitHub account ([Sign up here](https://github.com))
- ✅ Vercel account ([Sign up here](https://vercel.com))
- ✅ MongoDB Atlas account ([Sign up here](https://www.mongodb.com/atlas))
- ✅ Clerk account ([Sign up here](https://clerk.com))
- ✅ Gemini API key ([Get here](https://makersuite.google.com/app/apikey))
- ✅ Git installed on your machine
- ✅ Project code ready locally

---

## Part 1: Prepare Production Services

### Step 1: Set Up MongoDB Atlas (Database)

**Why:** Production database for storing users, jobs, resumes, matches, etc.

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Sign up or log in
3. Create a new project: "AI-Resume-Production"
4. Build a cluster:
   - Choose **FREE M0 cluster** (512 MB storage, shared CPU)
   - Select cloud provider: **AWS**
   - Region: Choose closest to your users (e.g., US East)
   - Cluster name: `ai-resume-cluster`
   - Click **Create Cluster** (takes 3-5 minutes)

5. **Create Database User:**
   - Go to **Database Access** (left sidebar)
   - Click **Add New Database User**
   - Authentication Method: **Password**
   - Username: `airesume-user`
   - Password: Generate secure password (save it!)
   - Database User Privileges: **Read and write to any database**
   - Click **Add User**

6. **Whitelist IP Addresses:**
   - Go to **Network Access** (left sidebar)
   - Click **Add IP Address**
   - Click **Allow Access from Anywhere**
   - IP Address: `0.0.0.0/0` (already filled)
   - Comment: "Vercel deployment"
   - Click **Confirm**
   - ⚠️ **Note:** For production, restrict to specific IPs for better security

7. **Get Connection String:**
   - Go to **Database** → Click **Connect** on your cluster
   - Choose **Connect your application**
   - Driver: **Node.js**, Version: **5.5 or later**
   - Copy the connection string, it looks like:
     ```
     mongodb+srv://airesume-user:<password>@ai-resume-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://airesume-user:YOUR_PASSWORD@ai-resume-cluster.xxxxx.mongodb.net/ai-resume?retryWrites=true&w=majority`
   - **Save this connection string!** You'll need it for Vercel environment variables

---

### Step 2: Configure Clerk for Production

**Why:** Authentication and user management service

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your existing project or create a new one: "AI Resume Production"
3. Go to **API Keys** (left sidebar)
4. Copy both keys:
   - **Publishable Key** (starts with `pk_live_` or `pk_test_`)
   - **Secret Key** (starts with `sk_live_` or `sk_test_`)
   - **Save both keys!**

5. Configure Social Logins (optional but recommended):
   - Go to **User & Authentication** → **Social Connections**
   - Enable Google, GitHub, or other providers
   - Follow setup instructions for each provider

6. Set Up User Metadata:
   - Go to **User & Authentication** → **Metadata**
   - Ensure `role` field exists in public metadata
   - This is used to distinguish between candidates and recruiters

7. Configure Redirects:
   - Go to **Paths**
   - Set up redirect URLs:
     - Sign-in URL: `/sign-in`
     - Sign-up URL: `/sign-up`
     - After sign-in: `/dashboard`
     - After sign-up: `/onboarding`

---

### Step 3: Get Gemini API Key

**Why:** AI-powered resume parsing and mock interview generation

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click **Get API Key** → **Create API key in new project**
4. Copy the API key (starts with `AI...`)
5. **Save this key!**

**Free Tier Limits:**
- 15 requests per minute
- 1,500 requests per day
- Sufficient for testing and small-scale production

---

## Part 2: Push Code to GitHub

### Step 1: Initialize Git Repository

Open PowerShell in your project root (`d:\Ai-resume`):

```powershell
# Check if git is already initialized
git status

# If not initialized, run:
git init

# Configure git if first time
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 2: Stage All Files

```powershell
# Add all files to staging
git add .

# Check what will be committed
git status
```

You should see files listed, but `.env` files should be ignored (they're in `.gitignore`).

### Step 3: Create Initial Commit

```powershell
# Commit all changes
git commit -m "Initial commit: AI Resume Platform with Gemini 2.5 Flash integration"
```

### Step 4: Create GitHub Repository

**Option A: Via GitHub Website**

1. Go to [GitHub](https://github.com)
2. Click **+** (top right) → **New repository**
3. Repository name: `ai-resume-platform`
4. Description: "AI-powered recruitment platform with resume parsing, job matching, and mock interviews"
5. Visibility: **Public** (or Private if you prefer)
6. ⚠️ **Do NOT initialize with README, .gitignore, or license** (we already have them)
7. Click **Create repository**

**Option B: Via GitHub CLI (if installed)**

```powershell
gh repo create ai-resume-platform --public --source=. --remote=origin --push
```

### Step 5: Push Code to GitHub

After creating the repository, GitHub will show commands like:

```powershell
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/ai-resume-platform.git

# Rename branch to main (if needed)
git branch -M main

# Push code
git push -u origin main
```

**Verify:** Refresh your GitHub repository page - you should see all your code!

---

## Part 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New...** → **Project**
3. In "Import Git Repository" section:
   - Click **Import** next to your `ai-resume-platform` repository
   - If not listed, click **Adjust GitHub App Permissions** and grant access

#### Step 2: Configure Project

Vercel will auto-detect the monorepo structure with `vercel.json`.

**For Frontend:**
- **Project Name:** `ai-resume-frontend`
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

**For Backend:**
- **Project Name:** `ai-resume-backend`
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Output Directory:** Leave empty
- **Install Command:** `npm install`

#### Step 3: Add Environment Variables

**IMPORTANT:** Do this BEFORE clicking Deploy!

Click **Environment Variables** section:

**For Frontend Project, add these variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_xxxxx` (from Clerk) | Production |
| `CLERK_SECRET_KEY` | `sk_live_xxxxx` (from Clerk) | Production |
| `NEXT_PUBLIC_API_URL` | Leave empty for now | Production |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Production |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Production |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` | Production |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/onboarding` | Production |

**For Backend Project, add these variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `PORT` | `5000` | Production |
| `MONGODB_URI` | Your Atlas connection string | Production |
| `CLERK_SECRET_KEY` | `sk_live_xxxxx` (from Clerk) | Production |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_xxxxx` (from Clerk) | Production |
| `GEMINI_API_KEY` | Your Gemini API key | Production |
| `FRONTEND_URL` | Leave empty for now | Production |

#### Step 4: Deploy Backend First

1. Click **Deploy** on backend project
2. Wait 2-3 minutes for deployment
3. Once successful, copy the deployment URL:
   - Example: `https://ai-resume-backend-xxxxx.vercel.app`
   - **Save this URL!**

#### Step 5: Update Frontend Environment Variables

1. Go to backend project settings
2. Copy the production URL (e.g., `https://ai-resume-backend-xxxxx.vercel.app`)
3. Go to frontend project
4. Settings → Environment Variables
5. Update `NEXT_PUBLIC_API_URL` to: `https://ai-resume-backend-xxxxx.vercel.app/api`
6. Click **Save**

#### Step 6: Deploy Frontend

1. Deployments tab → Click **...** on latest deployment → **Redeploy**
2. Or click **Deploy** if not deployed yet
3. Wait 2-3 minutes
4. Copy the frontend URL:
   - Example: `https://ai-resume-frontend-xxxxx.vercel.app`

#### Step 7: Update Backend FRONTEND_URL

1. Go to backend project
2. Settings → Environment Variables
3. Update `FRONTEND_URL` to your frontend URL: `https://ai-resume-frontend-xxxxx.vercel.app`
4. Save and redeploy backend

#### Step 8: Update Clerk Allowed Origins

1. Go to Clerk Dashboard
2. Settings → Allowed Origins
3. Add your frontend URL: `https://ai-resume-frontend-xxxxx.vercel.app`
4. Save changes

---

### Option B: Deploy via Vercel CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd ../frontend
vercel --prod

# Follow prompts and add environment variables when asked
```

---

## Part 4: Post-Deployment Testing

### Step 1: Test Backend Health

```powershell
# Test backend health endpoint
curl https://your-backend-url.vercel.app/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Step 2: Test Frontend Loading

1. Visit your frontend URL in browser
2. Should see the landing page with sign-in/sign-up options

### Step 3: Test Authentication Flow

1. Click **Sign Up**
2. Create a new account
3. Complete onboarding
4. Should redirect to dashboard

### Step 4: Test Core Features

#### Test Resume Upload:
1. Go to dashboard → Upload Resume
2. Upload a sample PDF resume
3. Check if parsing works
4. Should see extracted information

#### Test Job Matching:
1. Create a recruiter account (set role in Clerk metadata)
2. Post a job
3. Check candidate dashboard
4. Should see job matches with percentage scores

#### Test Mock Interview:
1. Go to Mock Interview section
2. Start a new interview
3. Select domain and difficulty
4. Should see AI-generated questions
5. Submit answers
6. Should see evaluation and feedback

### Step 5: Check Vercel Logs

If any feature fails:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments** → Latest deployment
4. Click **View Function Logs**
5. Check for errors

Common issues:
- ❌ `MONGODB_URI not defined` → Add MongoDB connection string
- ❌ `CLERK_SECRET_KEY invalid` → Verify Clerk keys
- ❌ `GEMINI_API_KEY required` → Add Gemini API key
- ❌ CORS errors → Check `FRONTEND_URL` in backend matches actual frontend URL

---

## Part 5: Production Monitoring

### Set Up Vercel Monitoring

1. Go to project **Settings** → **Monitoring**
2. Enable:
   - ✅ Real-time logs
   - ✅ Error tracking
   - ✅ Performance monitoring

### Set Up MongoDB Atlas Monitoring

1. Go to Atlas dashboard
2. Click on cluster → **Metrics**
3. Monitor:
   - Connection count
   - Query performance
   - Storage usage

### Set Up Alerts

**Vercel Alerts:**
- Settings → Notifications
- Enable deployment failure alerts

**MongoDB Alerts:**
- Atlas → Alerts
- Set up alerts for:
  - CPU usage > 80%
  - Connection count > 80% of limit
  - Storage > 80% of quota

---

## Part 6: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to project **Settings** → **Domains**
2. Click **Add**
3. Enter your domain: `www.yourwebsite.com`
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic, takes ~1 hour)

### Update Environment Variables

After adding custom domain:

1. Update `FRONTEND_URL` in backend env vars
2. Update Clerk allowed origins
3. Redeploy both frontend and backend

---

## Troubleshooting Guide

### Issue: "Internal Server Error" on Resume Upload

**Cause:** Missing `GEMINI_API_KEY` or rate limit exceeded

**Fix:**
```powershell
# Check backend logs in Vercel
# Verify GEMINI_API_KEY is set correctly
# Check Gemini API quota usage
```

### Issue: "Unauthorized" on API Requests

**Cause:** Clerk authentication mismatch

**Fix:**
- Verify `CLERK_SECRET_KEY` matches on both frontend and backend
- Check Clerk allowed origins include your frontend URL
- Verify user is signed in

### Issue: Job Matches Not Showing

**Cause:** Database connection or matching algorithm issue

**Fix:**
- Check MongoDB connection string is correct
- Verify candidate uploaded resume
- Check backend logs for matching errors
- Try manual refresh button on dashboard

### Issue: Mock Interview 500 Error

**Cause:** Gemini API failure or missing candidate profile

**Fix:**
- System should fall back to curated questions
- Check backend logs
- Verify `GEMINI_API_KEY` is valid
- Ensure candidate profile exists

### Issue: CORS Errors

**Cause:** `FRONTEND_URL` mismatch in backend

**Fix:**
```
1. Go to backend env vars
2. Set FRONTEND_URL to exact frontend URL (no trailing slash)
3. Redeploy backend
```

---

## Environment Variables Reference

### Complete Frontend Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### Complete Backend Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-resume?retryWrites=true&w=majority
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
GEMINI_API_KEY=AIxxxxx
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## Success Checklist

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] Clerk project configured with API keys
- [ ] Gemini API key obtained
- [ ] Code pushed to GitHub successfully
- [ ] Backend deployed to Vercel with all env vars
- [ ] Frontend deployed to Vercel with all env vars
- [ ] Cross-reference URLs updated (frontend ↔ backend)
- [ ] Clerk allowed origins updated
- [ ] Authentication tested (sign up, sign in)
- [ ] Resume upload and parsing working
- [ ] Job matching displaying scores
- [ ] Mock interview functional
- [ ] Dashboard analytics loading
- [ ] Production monitoring enabled
- [ ] Deployment documentation updated

---

## Next Steps

After successful deployment:

1. **Add Sample Data:**
   - Create 5-10 sample job postings
   - Upload test resumes
   - Generate mock interviews

2. **Share & Test:**
   - Share frontend URL with team
   - Conduct user acceptance testing
   - Gather feedback

3. **Monitor Performance:**
   - Check Vercel analytics
   - Monitor MongoDB usage
   - Review Gemini API quota

4. **Optimize:**
   - Enable Vercel Edge Functions for better performance
   - Set up CDN for static assets
   - Implement caching strategies

5. **Scale:**
   - Upgrade MongoDB cluster if needed
   - Consider Vercel Pro plan for team features
   - Implement rate limiting for API endpoints

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas Docs:** https://www.mongodb.com/docs/atlas
- **Clerk Docs:** https://clerk.com/docs
- **Gemini API Docs:** https://ai.google.dev/docs
- **GitHub Issues:** Create issue in your repository

---

**Deployment Complete! 🎉**

Your AI Resume platform is now live and ready for users!
