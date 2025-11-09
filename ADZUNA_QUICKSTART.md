# Quick Start Guide - Adzuna Integration

## 🚀 Get Started in 3 Steps

### Step 1: Get API Credentials (2 minutes)

1. Go to https://developer.adzuna.com/
2. Click "Sign Up" (free)
3. Create an app → Copy your **App ID** and **App Key**

### Step 2: Add Credentials

**Backend** (`backend/.env`):
```env
ADZUNA_APP_ID=12345678
ADZUNA_APP_KEY=abcdef1234567890
ADZUNA_COUNTRY=us
```

**Frontend** (`frontend/.env.local`):
```env
ADZUNA_APP_ID=12345678
ADZUNA_APP_KEY=abcdef1234567890
ADZUNA_COUNTRY=us
```

### Step 3: Use the Importer

**For Recruiters:**
1. Visit `/jobs/import`
2. Search for jobs (e.g., "React Developer" in "San Francisco")
3. Click "Import & Match Jobs"
4. Jobs are saved and auto-matched with all candidates

**For Candidates:**
1. Visit `/jobs/import` OR `/jobs` (existing jobs page)
2. See imported jobs with **your match score** next to each
3. Jobs ranked by compatibility (70%+ = Excellent Match)

## 🎯 How Matching Works

When you import a job:

```
1. Adzuna API → Fetch 20 jobs
2. Extract skills from description (JavaScript, React, Python, etc.)
3. Save to MongoDB with company, salary, location
4. Background: Calculate match % for ALL candidates
5. Display jobs with match scores
```

**Match Score Breakdown:**
- 40% - Skills match (Jaccard similarity)
- 25% - Experience level
- 15% - Location compatibility
- 10% - Salary range
- 10% - Job type (full-time, contract, etc.)

## 📊 Example Usage

### Search Query:
- **Keyword**: "Full Stack Developer"
- **Location**: "New York"
- **Min Salary**: "100000"
- **Country**: USA

### Results:
```
✅ Imported 18 jobs

For Candidate "John Doe":
- Senior Full Stack Engineer @ Google - 92% Match ⭐
- Full Stack Developer @ Stripe - 85% Match ⭐
- Software Engineer @ Amazon - 78% Match ⭐
- Junior Developer @ Startup - 45% Match
```

## 🔍 Where to Find Jobs

After import:

1. **Candidate Dashboard** → "Top Matches" section (shows imported jobs)
2. **Jobs Page** (`/jobs`) → All jobs with match scores
3. **Job Import Page** (`/jobs/import`) → See just-imported jobs

## ⚡ Pro Tips

✅ **Use specific keywords**: "React Developer" > "Developer"  
✅ **Include location**: Better local job matches  
✅ **Set salary filter**: Avoid wasting time on low offers  
✅ **Upload resume first** (candidates): Required for match calculation  
✅ **Import regularly**: New jobs posted daily on Adzuna  

## 🐛 Troubleshooting

**"Missing credentials" error?**
→ Restart both backend and frontend after adding to .env

**No match scores showing?**
→ Candidates must upload resume first
→ Wait 5 seconds after import for background matching

**Rate limit error?**
→ Free tier = 1000 calls/month (plenty for most use cases)

## 🎨 UI Features

- ✨ Animated search form with Framer Motion
- 🎯 Real-time match score badges (green/yellow/orange)
- 💼 Skills extracted and displayed as tags
- 📍 Location & salary chips
- 🔗 Direct "Apply" links to Adzuna listings
- 📊 Match score breakdown (skills, experience, location, etc.)

---

**Ready to go?** Start importing jobs at `/jobs/import`! 🚀
