# 🚀 Quick Deploy Guide

Your project is now ready to push to GitHub and deploy to Vercel! Follow these steps:

---

## ✅ What's Already Done

- ✅ Git repository initialized
- ✅ All files committed (77 files, 27,304 lines)
- ✅ `.gitignore` configured (secrets are protected)
- ✅ `vercel.json` configured for monorepo deployment
- ✅ Environment variable templates created
- ✅ Complete deployment documentation prepared

---

## 📝 Next Steps

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon (top right) → **New repository**
3. Fill in:
   - **Repository name:** `ai-resume-platform`
   - **Description:** AI-powered recruitment platform with resume parsing, job matching, and mock interviews using Gemini AI 2.5 Flash
   - **Visibility:** Public (or Private)
   - **⚠️ IMPORTANT:** Do NOT check any of these:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
4. Click **Create repository**

### Step 2: Push Code to GitHub

GitHub will show you commands. Run these in PowerShell:

```powershell
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/ai-resume-platform.git

# Rename branch to main (standard practice)
git branch -M main

# Push all code to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username!

After running these commands, refresh your GitHub page - you should see all 77 files uploaded!

---

### Step 3: Set Up Production Services

Before deploying, you need to set up these services (all have free tiers):

#### 3.1 MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create free M0 cluster
3. Create database user with username and password
4. Whitelist IP: `0.0.0.0/0` (allow all - required for Vercel)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ai-resume?retryWrites=true&w=majority
   ```
6. **Save this connection string!**

**Detailed instructions:** See `DEPLOYMENT.md` → Part 1, Step 1

#### 3.2 Clerk Authentication
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create project (or use existing)
3. Go to **API Keys**
4. Copy:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)
5. **Save both keys!**

**Detailed instructions:** See `DEPLOYMENT.md` → Part 1, Step 2

#### 3.3 Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. **Save the key!** (starts with `AI...`)

**Detailed instructions:** See `DEPLOYMENT.md` → Part 1, Step 3

---

### Step 4: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Easier)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New...** → **Project**
3. Click **Import** next to your `ai-resume-platform` repository
4. Vercel will auto-detect the monorepo structure

**Configure Environment Variables:**

Click **Environment Variables** and add:

**Frontend Variables:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = your_clerk_publishable_key
CLERK_SECRET_KEY = your_clerk_secret_key
NEXT_PUBLIC_API_URL = (leave empty for now)
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /onboarding
```

**Backend Variables:**
```
NODE_ENV = production
PORT = 5000
MONGODB_URI = your_mongodb_atlas_connection_string
CLERK_SECRET_KEY = your_clerk_secret_key
CLERK_PUBLISHABLE_KEY = your_clerk_publishable_key
GEMINI_API_KEY = your_gemini_api_key
FRONTEND_URL = (leave empty for now)
```

5. Click **Deploy**
6. Wait 3-5 minutes for deployment

**After Backend Deploys:**
- Copy backend URL (e.g., `https://ai-resume-backend-xxxxx.vercel.app`)
- Update frontend `NEXT_PUBLIC_API_URL` to: `https://your-backend-url.vercel.app/api`
- Redeploy frontend

**After Frontend Deploys:**
- Copy frontend URL (e.g., `https://ai-resume-frontend-xxxxx.vercel.app`)
- Update backend `FRONTEND_URL` to: `https://your-frontend-url.vercel.app`
- Redeploy backend

#### Option B: Via Vercel CLI (Faster)

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root
vercel

# Follow prompts and add environment variables
```

**Detailed step-by-step instructions:** See `DEPLOYMENT.md` → Part 3

---

### Step 5: Update Clerk Allowed Origins

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Your project → **Settings** → **Allowed Origins**
3. Add your frontend URL: `https://your-frontend-url.vercel.app`
4. Click **Save**

---

### Step 6: Test Your Deployment

1. Visit your frontend URL
2. Test these features:
   - ✅ Sign up / Sign in
   - ✅ Upload resume
   - ✅ View job matches with percentage scores
   - ✅ Start mock interview
   - ✅ Dashboard analytics

**Troubleshooting:** See `DEPLOYMENT.md` → Part 6

---

## 📚 Documentation Files

Your project includes comprehensive documentation:

| File | Purpose |
|------|---------|
| `README.md` | Project overview, features, tech stack, local setup |
| `DEPLOYMENT.md` | Complete deployment guide (30-45 min walkthrough) |
| `QUICKSTART.md` | Quick setup for local development |
| `ARCHITECTURE.md` | System architecture and design |
| `PROJECT_STRUCTURE.md` | File structure and code organization |

**For detailed deployment:** Open `DEPLOYMENT.md` - it has step-by-step screenshots and troubleshooting.

---

## 🆘 Need Help?

### Common Issues

**"git: command not found"**
- Install Git: https://git-scm.com/download/win

**"Permission denied (publickey)"**
- Set up SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

**"Unable to connect to MongoDB"**
- Verify connection string format
- Check if IP `0.0.0.0/0` is whitelisted
- Ensure username/password are correct

**"Clerk authentication failed"**
- Verify both keys are correct (publishable and secret)
- Check if frontend URL is in Clerk allowed origins
- Ensure keys match between frontend and backend

**"Gemini API error"**
- Verify API key is valid
- Check if you've exceeded free tier limits (15 req/min)
- System will use fallback questions if AI fails

### Where to Get Help

- **Vercel:** [vercel.com/docs](https://vercel.com/docs)
- **MongoDB:** [mongodb.com/docs/atlas](https://www.mongodb.com/docs/atlas)
- **Clerk:** [clerk.com/docs](https://clerk.com/docs)
- **Gemini:** [ai.google.dev/docs](https://ai.google.dev/docs)

---

## 🎯 Checklist

Use this checklist to track your deployment:

```
Setup:
[ ] Created GitHub repository
[ ] Pushed code to GitHub (77 files)
[ ] MongoDB Atlas cluster created
[ ] Clerk project configured
[ ] Gemini API key obtained

Deployment:
[ ] Backend deployed to Vercel
[ ] Frontend deployed to Vercel
[ ] All environment variables added
[ ] Cross-referenced URLs updated
[ ] Clerk allowed origins updated

Testing:
[ ] Sign up/Sign in working
[ ] Resume upload functional
[ ] Job matches visible with scores
[ ] Mock interviews working
[ ] Dashboard loading correctly
```

---

## 🚀 After Deployment

Once everything is deployed and working:

1. **Share Your Work:**
   - Share frontend URL with friends/colleagues
   - Add live demo link to GitHub README
   - Post on LinkedIn/Twitter

2. **Monitor Usage:**
   - Check Vercel analytics
   - Monitor MongoDB queries
   - Track Gemini API usage

3. **Optimize:**
   - Enable Vercel Edge Functions
   - Set up custom domain
   - Implement caching

4. **Enhance:**
   - Add video interviews
   - Implement email notifications
   - Add mobile responsiveness
   - Create mobile app

---

**Ready to deploy? Start with Step 1! 🚀**

For detailed instructions, open `DEPLOYMENT.md`.
