# Adzuna Job Search Integration

## Overview

This integration allows you to import jobs from the Adzuna API directly into your AI Resume Matcher platform. Jobs are automatically matched with candidates using the existing matching algorithm (Jaccard similarity for skills, experience scoring, location matching, salary compatibility).

## Features

✅ **Import Jobs from Adzuna API** - Search and import real job listings  
✅ **Automatic Skill Extraction** - AI extracts technical skills from job descriptions  
✅ **Auto-Matching** - Jobs are matched with all candidates in background  
✅ **Match Score Display** - Candidates see their % match for each imported job  
✅ **Top Matches** - Jobs ranked by compatibility for each candidate  

## Setup Instructions

### 1. Get Adzuna API Credentials

1. Visit [https://developer.adzuna.com/](https://developer.adzuna.com/)
2. Sign up for a free account
3. Create a new app to get your `app_id` and `app_key`

### 2. Configure Backend

Add to `backend/.env`:

```env
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
ADZUNA_COUNTRY=us
```

### 3. Configure Frontend (Next.js API Route)

Add to `frontend/.env.local`:

```env
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
ADZUNA_COUNTRY=us
```

### 4. Start Servers

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Usage

### Import Jobs (Recommended)

Visit: `http://localhost:3000/jobs/import`

1. Enter job keyword (e.g., "React Developer", "Data Scientist")
2. Enter location (city or zip code)
3. Optionally set minimum salary
4. Select country
5. Click "Import & Match Jobs"

Jobs will be:
- Saved to MongoDB with extracted skills
- Automatically matched with all candidates
- Displayed with match scores for logged-in candidates

### API Routes

#### Frontend Next.js API (Direct Adzuna fetch)
```
GET /api/adzuna?keyword=developer&location=New York&salary=80000
```

Returns raw Adzuna results (for preview, not saved to DB).

#### Backend API (Import to Database)
```
POST http://localhost:5000/api/adzuna/import
Content-Type: application/json
Authorization: Bearer <clerk-token>

{
  "keyword": "React Developer",
  "location": "San Francisco",
  "salary": "100000",
  "country": "us"
}
```

Returns:
```json
{
  "success": true,
  "imported": 15,
  "errors": 0,
  "jobs": [...]
}
```

## How It Works

### 1. Job Import Flow

```
User searches → Backend fetches from Adzuna → Extract skills from description 
  → Save to MongoDB → Trigger matching in background → Display with match scores
```

### 2. Skill Extraction

Jobs descriptions are analyzed for technical keywords:
- Languages: JavaScript, Python, Java, C++, etc.
- Frameworks: React, Vue, Angular, Node, Django, etc.
- Databases: MongoDB, PostgreSQL, MySQL, Redis
- Cloud: AWS, Azure, GCP
- Tools: Docker, Kubernetes, Git, Jenkins

### 3. Matching Algorithm

Jobs are matched using weighted scoring:
- **Skills Match (40%)**: Jaccard similarity between candidate & job skills
- **Experience Match (25%)**: Candidate years vs job requirements
- **Location Match (15%)**: City > State > Country > Remote
- **Salary Match (10%)**: Overlap between candidate expectations & job offer
- **Job Type Match (10%)**: Full-time, part-time, contract, etc.

### 4. Background Processing

When jobs are imported:
1. Response returned immediately to user
2. Matching runs asynchronously in background
3. Matches saved to `Match` collection
4. Candidates can view matches instantly on next page load

## Database Schema

### Job Model Extensions

```javascript
{
  // ... existing fields
  metadata: {
    source: 'adzuna',
    externalId: 'adzuna-job-12345',
    externalUrl: 'https://www.adzuna.com/...',
    importedAt: '2025-01-09T12:00:00Z'
  }
}
```

## Components

### Frontend Components

- **`AdzunaJobImporter.tsx`** - Main import UI with search form and results
- **`SearchJobs.tsx`** - Simple search component (preview only, not saved)
- **`JobCard.tsx`** - Job display card

### Backend Routes

- **`adzuna.routes.js`** - Import endpoint with skill extraction and matching

### API Client

- **`lib/api.ts`** - Added `importAdzunaJobs()` method

## Troubleshooting

### "Missing Adzuna credentials" Error

Make sure both `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` are set in:
- `backend/.env`
- `frontend/.env.local`

Restart both servers after adding credentials.

### No Match Scores Showing

1. Make sure you're logged in as a **candidate**
2. Upload your resume first (needed for matching)
3. Wait ~5 seconds after import for background matching to complete
4. Refresh the page

### Jobs Not Importing

Check backend console for errors. Common issues:
- Invalid Adzuna API credentials
- Rate limit exceeded (free tier: 1000 calls/month)
- Invalid country code (use 2-letter codes: us, gb, ca, au, de)

## API Limits

**Adzuna Free Tier:**
- 1000 API calls per month
- 20 results per search
- Rate limit: reasonable use

## Future Enhancements

- [ ] Bulk import with pagination
- [ ] Schedule automatic imports (daily/weekly)
- [ ] Filter by experience level
- [ ] Cache frequently searched positions
- [ ] Enhanced skill extraction using Gemini AI
- [ ] Duplicate job detection
- [ ] Job expiration handling

## Support

For issues with:
- **Adzuna API**: Visit https://developer.adzuna.com/support
- **Integration**: Check backend logs and ensure MongoDB is running
- **Matching**: Review `jobMatching.service.js` algorithm

---

Built with ❤️ for AI Resume Matcher
