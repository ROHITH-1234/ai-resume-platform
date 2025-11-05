# 🚀 AI Resume Matcher - Quick Start

## Installation

1. **Run Setup Script**
   ```powershell
   .\setup.ps1
   ```
   This will install all dependencies for both backend and frontend.

2. **Configure Environment Variables**
   
   Edit `backend/.env`:
   - Add your MongoDB URI (local or Atlas)
   - Add your Clerk Secret Key
   - Add your Gemini API Key
   - (Optional) Add email/calendar/Twilio credentials

   Edit `frontend/.env.local`:
   - Add your Clerk Publishable Key
   - Verify API URLs point to localhost:5000

3. **Start MongoDB** (if using local)
   ```powershell
   mongod
   ```

4. **Start Both Servers**
   ```powershell
   .\start.ps1
   ```

   This opens two terminal windows:
   - Backend on http://localhost:5000
   - Frontend on http://localhost:3000

## Manual Start (Alternative)

### Backend
```powershell
cd backend
npm install
npm run dev
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

## First Time Setup

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create an account with Clerk
4. After signup, go to Clerk Dashboard → Users → Select your user → Public Metadata
5. Add: `{ "role": "candidate" }` or `{ "role": "recruiter" }`
6. Refresh the page and you're ready!

## Testing Features

### As Candidate
1. Upload resume (PDF/DOCX)
2. Wait for AI parsing (check status)
3. View job matches
4. Start mock interview
5. Check analytics

### As Recruiter
1. Create job posting
2. View candidate matches
3. Schedule interviews
4. Submit feedback
5. Check analytics

## Need Help?

See full documentation in `README.md`
