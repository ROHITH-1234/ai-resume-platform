# 🚀 AI Resume - Intelligent Recruitment Platform

A comprehensive AI-powered recruitment platform featuring resume parsing, intelligent job matching, automated interview scheduling, mock interviews with Gemini AI 2.5 Flash, real-time chat, and analytics.

---

## 🌟 Features

### 1. 🧾 AI Resume Parser
- Automatically extracts candidate details (name, email, education, experience, skills, certifications)
- Supports PDF and DOC/DOCX formats
- Uses **Gemini AI** for NLP-based parsing
- Identifies technical and soft skills
- Provides resume improvement suggestions

### 2. 🤖 AI Job Matching System
- Matches candidates to jobs based on:
  - Skills similarity (40% weight)
  - Experience level (25% weight)
  - Location (15% weight)
  - Salary expectations (10% weight)
  - Job type (10% weight)
- Generates Match Score (0-100%) for each candidate-job pair
- Shows top matches for both recruiters and candidates

### 3. 📅 Real-Time Interview Scheduler
- Checks availability via Google Calendar / Outlook integration
- Generates meeting links (Google Meet / Zoom)
- Sends email notifications and reminders
- Supports rescheduling and cancellation

### 4. 🧠 AI-Powered Mock Interview Assistant
- Generates domain-specific interview questions
- Evaluates answers for:
  - Accuracy
  - Communication clarity
  - Confidence level
- Provides detailed feedback and improvement tips

### 5. 👨‍💼 Recruiter Dashboard
- View all applicants with AI-generated match scores
- Filter and sort candidates by skills, experience, or score
- One-click interview scheduling
- Track interview history and analytics

### 6. 👩‍💻 Candidate Dashboard
- View applied jobs with match percentages
- Upcoming interview details
- AI feedback from mock interviews
- Resume enhancement suggestions
- Skill-gap analysis

### 7. 🔐 Authentication & Roles
- Multi-role login: Admin, Recruiter, Candidate
- Powered by **Clerk Authentication**
- Role-based access control (RBAC)

### 8. 💬 Smart Communication System
- Real-time chat between recruiter and candidate (Socket.IO)
- Email notifications (Nodemailer)
- WhatsApp notifications (Twilio)
- AI-generated auto-responses

### 9. 📈 Analytics & Reports
- **Recruiter Analytics:**
  - Average hiring time
  - Match trends
  - Skill demand analytics
- **Candidate Analytics:**
  - Profile visibility
  - Skill-gap analysis
  - Resume improvement suggestions

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose** (Database)
- **Clerk** (Authentication)
- **Gemini AI** (Resume parsing, mock interviews)
- **Socket.IO** (Real-time chat)
- **Nodemailer** (Email notifications)
- **Twilio** (WhatsApp notifications)
- **Google Calendar API** (Scheduling)
- **PDF-Parse** & **Mammoth** (Document parsing)

### Frontend
- **Next.js 14** (React framework)
- **TypeScript**
- **Tailwind CSS** (Styling)
- **Clerk** (Frontend auth)
- **Axios** (API client)
- **Socket.IO Client** (Real-time)
- **Recharts** (Analytics visualization)
- **Lucide React** (Icons)

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB running locally or Atlas connection string
- Clerk account (for auth)
- Gemini API key (for AI features)

### Backend Setup

```powershell
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-resume

CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

GEMINI_API_KEY=your_gemini_api_key_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

FRONTEND_URL=http://localhost:3000
```

Start backend server:

```powershell
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### Frontend Setup

```powershell
cd frontend
npm install
```

Create `.env.local` file (copy from `.env.local.example`):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

Start frontend:

```powershell
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🚀 Quick Start Guide

### 1. Set Up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create a project
2. Get your Publishable Key and Secret Key
3. Add them to both backend and frontend `.env` files
4. In Clerk Dashboard → User & Authentication → Metadata, add a custom field: `role` (values: `admin`, `recruiter`, `candidate`)

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to backend `.env` as `GEMINI_API_KEY`

### 3. Set Up MongoDB

**Option 1: Local MongoDB**
```powershell
# Install MongoDB and start service
mongod
```

**Option 2: MongoDB Atlas**
- Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Get connection string and add to `.env`

### 4. Start Both Servers

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:5000/api**
- Health Check: **http://localhost:5000/health**

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/sync-role` - Sync user role with Clerk
- `GET /api/auth/me` - Get current user info

### Resumes
- `POST /api/resumes/upload` - Upload and parse resume
- `GET /api/resumes/:resumeId/status` - Get parsing status
- `GET /api/resumes/my-resumes` - Get candidate's resumes

### Jobs
- `POST /api/jobs` - Create job posting (recruiter)
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:jobId` - Get single job
- `PUT /api/jobs/:jobId` - Update job
- `DELETE /api/jobs/:jobId` - Delete job

### Matches
- `GET /api/matches/candidate` - Get candidate's matches
- `GET /api/matches/job/:jobId` - Get job's matches (recruiter)
- `POST /api/matches/candidate/trigger` - Trigger matching for candidate
- `POST /api/matches/job/:jobId/trigger` - Trigger matching for job
- `PATCH /api/matches/:matchId/status` - Update match status (recruiter)
- `PATCH /api/matches/:matchId/interest` - Express interest (candidate)

### Interviews
- `POST /api/interviews` - Schedule interview (recruiter)
- `GET /api/interviews` - Get interviews
- `GET /api/interviews/:interviewId` - Get single interview
- `PATCH /api/interviews/:interviewId/status` - Update status
- `POST /api/interviews/:interviewId/feedback` - Submit feedback (recruiter)
- `PATCH /api/interviews/:interviewId/reschedule` - Reschedule

### Mock Interviews
- `POST /api/mock-interviews/start` - Start mock interview
- `POST /api/mock-interviews/:interviewId/answer` - Submit answer
- `POST /api/mock-interviews/:interviewId/complete` - Complete interview
- `GET /api/mock-interviews/my-interviews` - Get candidate's mock interviews

### Chat
- `GET /api/chat` - Get user's chats
- `POST /api/chat/match/:matchId` - Get/create chat for match
- `GET /api/chat/:chatId/messages` - Get messages
- `POST /api/chat/:chatId/messages` - Send message

### Analytics
- `GET /api/analytics/recruiter` - Recruiter analytics
- `GET /api/analytics/candidate` - Candidate analytics
- `GET /api/analytics/admin` - Admin analytics

---

## 🧪 Testing

### Test Resume Upload
```powershell
curl -X POST http://localhost:5000/api/resumes/upload `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -F "resume=@path/to/resume.pdf"
```

### Test Job Matching
```powershell
curl -X POST http://localhost:5000/api/matches/candidate/trigger `
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Database Models

- **Candidate** - User profiles with skills, experience, education
- **Resume** - Parsed resume data and AI suggestions
- **Job** - Job postings with requirements
- **Match** - Candidate-job matches with scores
- **Interview** - Scheduled interviews with feedback
- **MockInterview** - Practice interview sessions
- **Chat** - Messaging between recruiters and candidates

---

## 🎨 User Flows

### Candidate Flow
1. Sign up → Upload Resume → AI parses data
2. View job matches with scores
3. Express interest in jobs
4. Schedule interviews
5. Practice with mock interviews
6. Track applications and analytics

### Recruiter Flow
1. Sign up → Post job
2. AI matches candidates automatically
3. Review top matches with scores
4. Schedule interviews with candidates
5. Submit feedback after interviews
6. Track hiring metrics and analytics

---

## 🔑 Environment Variables Reference

### Required (Backend)
- `MONGODB_URI` - MongoDB connection string
- `CLERK_SECRET_KEY` - Clerk authentication key
- `GEMINI_API_KEY` - Google Gemini AI key

### Required (Frontend)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Optional (Backend)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For calendar integration
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` - For WhatsApp notifications
- `EMAIL_USER` / `EMAIL_PASS` - For email notifications
- `ZOOM_API_KEY` / `ZOOM_API_SECRET` - For Zoom meetings

---

## 📝 Notes

- **Gemini AI 2.5 Flash:** Used for resume parsing and mock interviews with comprehensive fallback system
- **Job Matching:** Automatic matching triggered on job creation and resume upload (30% minimum threshold)
- **Mock Interviews:** 45+ curated fallback questions across 3 difficulty levels if AI unavailable
- **File Uploads:** Stored in `backend/uploads/resumes/`
- **Match Display:** Color-coded badges (green ≥70%, yellow ≥50%, orange <50%)

---

## 🚀 Deployment Guide

### Deploy to Vercel (Recommended)

#### Prerequisites
- GitHub account
- Vercel account (free tier available)
- MongoDB Atlas account (free tier available)
- Clerk account (free tier available)
- Gemini API key (free tier available)

#### Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create database user (Database Access → Add New Database User)
4. Whitelist all IPs (Network Access → Add IP Address → Allow Access from Anywhere: `0.0.0.0/0`)
5. Get connection string (Database → Connect → Connect your application)
   - Should look like: `mongodb+srv://username:password@cluster.mongodb.net/ai-resume?retryWrites=true&w=majority`

#### Step 2: Set Up Clerk Production Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your project or create new one
3. Go to API Keys
4. Copy both:
   - Publishable Key (starts with `pk_live_` or `pk_test_`)
   - Secret Key (starts with `sk_live_` or `sk_test_`)

#### Step 3: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Save it securely

#### Step 4: Push to GitHub

Open PowerShell in project root:

```powershell
# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI Resume Platform"

# Create GitHub repository (via GitHub.com)
# Then add remote and push:
git remote add origin https://github.com/YOUR_USERNAME/ai-resume.git
git branch -M main
git push -u origin main
```

#### Step 5: Deploy on Vercel

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect monorepo structure
5. Configure builds:
   - **Frontend:**
     - Root Directory: `frontend`
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - **Backend:**
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Output Directory: `src`
6. Click "Deploy"

**Option B: Via Vercel CLI**

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? ai-resume
# - Directory? ./ (root)
# - Override settings? No
```

#### Step 6: Configure Environment Variables

After deployment, add environment variables:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable below:

**Frontend Variables:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

**Backend Variables:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-resume?retryWrites=true&w=majority
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=https://your-frontend-url.vercel.app
```

4. Click "Save" for each variable
5. Redeploy: Deployments → Click "..." on latest → Redeploy

#### Step 7: Update API URL

After backend deploys, update frontend:

1. Copy backend URL from Vercel deployment (e.g., `https://your-backend.vercel.app`)
2. Go to frontend project settings
3. Update `NEXT_PUBLIC_API_URL` to `https://your-backend.vercel.app/api`
4. Redeploy frontend

#### Step 8: Test Production Deployment

1. Visit your frontend URL
2. Test key features:
   - ✅ Sign up/Sign in
   - ✅ Upload resume
   - ✅ View job matches
   - ✅ Start mock interview
   - ✅ Check analytics dashboard

### Alternative Deployment Options

#### Backend on Railway

1. Go to [Railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select backend folder
4. Add environment variables
5. Deploy
6. Copy production URL and update frontend `NEXT_PUBLIC_API_URL`

#### Backend on Render

1. Go to [Render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `node src/server.js`
7. Add environment variables
8. Create Web Service

### Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] MongoDB Atlas connected successfully
- [ ] Clerk authentication working
- [ ] Resume upload and parsing functional
- [ ] Job matching displaying scores
- [ ] Mock interviews working with Gemini AI
- [ ] Dashboard analytics loading
- [ ] Real-time features operational
- [ ] All environment variables set correctly
- [ ] GitHub repository updated with latest code

---

## 🐛 Common Issues

### Backend won't start
- Check MongoDB is running
- Verify all required env vars are set
- Run `npm install` again

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check CORS settings in backend

### Resume parsing fails
- Verify `GEMINI_API_KEY` is valid
- Check Gemini API quota
- Ensure uploaded file is PDF/DOC/DOCX

---

## 📄 License

MIT License

---

## 🤝 Contributing

This is a full-featured demo project. Feel free to extend it with:
- Video interview recording
- Skills assessment tests
- Referral system
- Mobile app (React Native)
- Advanced analytics dashboards

---

**Built with ❤️ using Node.js, Next.js, MongoDB, Clerk, and Gemini AI**
