# 🏗️ AI Resume Matcher - System Architecture

## 📊 Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                           │
│                         (Next.js 15 + React 18)                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────┐ ┌─────────────────┐
            │   Landing    │ │  Auth    │ │   Onboarding    │
            │     Page     │ │  Pages   │ │  (Role Setup)   │
            └──────────────┘ └──────────┘ └─────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼                               ▼
        ┌──────────────────────┐      ┌──────────────────────┐
        │  Candidate Dashboard │      │  Recruiter Dashboard │
        │   - Upload Resume    │      │    - Post Jobs       │
        │   - View Matches     │      │    - View Matches    │
        │   - Mock Interview   │      │    - Schedule Int.   │
        │   - Analytics        │      │    - Analytics       │
        └──────────────────────┘      └──────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION LAYER                              │
│                         (Clerk + JWT Tokens)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API CLIENT LAYER                                │
│                    (Axios + Token Interceptor)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            HTTP Requests      WebSocket      Real-time Updates
                    │          (Socket.IO)           │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API LAYER                                 │
│                   (Express.js + Socket.IO Server)                       │
│                         Port 5000                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐           ┌──────────────┐
│ Auth Routes  │          │ Resume Routes│           │  Job Routes  │
│ /api/auth/*  │          │ /api/resumes │           │  /api/jobs   │
└──────────────┘          └──────────────┘           └──────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐           ┌──────────────┐
│ Match Routes │          │Interview Rts │           │  Chat Routes │
│ /api/matches │          │/api/interviews│          │  /api/chat   │
└──────────────┘          └──────────────┘           └──────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC LAYER                               │
│                           (Services)                                     │
└─────────────────────────────────────────────────────────────────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
┌────────────────┐      ┌────────────────┐        ┌────────────────┐
│ Resume Parser  │      │  Job Matching  │        │   Scheduler    │
│   Service      │      │    Service     │        │    Service     │
│                │      │                │        │                │
│ - Extract PDF  │      │ - Skills (40%) │        │ - Availability │
│ - Parse DOCX   │      │ - Exp (25%)    │        │ - Calendar     │
│ - Gemini AI    │      │ - Location(15%)│        │ - Conflicts    │
│ - Suggestions  │      │ - Salary (10%) │        │ - Meetings     │
└────────────────┘      └────────────────┘        └────────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
┌────────────────┐      ┌────────────────┐        ┌────────────────┐
│ Mock Interview │      │  Notification  │        │   Analytics    │
│    Service     │      │    Service     │        │    Service     │
│                │      │                │        │                │
│ - Gen Questions│      │ - Email        │        │ - Aggregations │
│ - Evaluate     │      │ - WhatsApp     │        │ - Trends       │
│ - Gemini AI    │      │ - Socket.IO    │        │ - Reports      │
└────────────────┘      └────────────────┘        └────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL AI SERVICES                               │
│                      (Google Gemini API)                                │
│                                                                          │
│  - Resume Parsing: Extract skills, experience, education               │
│  - Job Matching: Calculate compatibility scores                        │
│  - Mock Interviews: Generate questions & evaluate answers              │
│  - Suggestions: Provide resume improvement tips                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                           │
│                        (MongoDB + Mongoose)                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐           ┌──────────────┐
│   Candidate  │          │    Resume    │           │     Job      │
│    Model     │          │    Model     │           │    Model     │
│              │          │              │           │              │
│ - Profile    │          │ - Parsed Data│           │ - Details    │
│ - Skills     │          │ - Status     │           │ - Reqs       │
│ - Experience │          │ - AI Suggest │           │ - Salary     │
└──────────────┘          └──────────────┘           └──────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐           ┌──────────────┐
│    Match     │          │  Interview   │           │  MockInt     │
│    Model     │          │    Model     │           │    Model     │
│              │          │              │           │              │
│ - Score 0-100│          │ - Schedule   │           │ - Questions  │
│ - Breakdown  │          │ - Feedback   │           │ - Evaluation │
│ - Status     │          │ - Status     │           │ - Score      │
└──────────────┘          └──────────────┘           └──────────────┘
                                    │
                                    ▼
                          ┌──────────────┐
                          │     Chat     │
                          │    Model     │
                          │              │
                          │ - Messages   │
                          │ - Unread     │
                          │ - Archived   │
                          └──────────────┘
```

## 🔄 Data Flow Examples

### 1️⃣ Resume Upload & Matching Flow

```
User → Upload Resume (PDF/DOCX)
  ↓
Frontend → POST /api/resumes/upload (multipart/form-data)
  ↓
Backend → resumeParser.service.js
  ↓
Extract Text (pdf-parse / mammoth)
  ↓
Send to Gemini API → Parse structured data
  ↓
Save to Resume Model (MongoDB)
  ↓
Trigger Job Matching → jobMatching.service.js
  ↓
Calculate scores for all jobs:
  - Skills similarity (40%)
  - Experience match (25%)
  - Location match (15%)
  - Salary match (10%)
  - Job type match (10%)
  ↓
Save Match Models with scores
  ↓
Return to Frontend → Display matches
```

### 2️⃣ Mock Interview Flow

```
User → Start Mock Interview
  ↓
Frontend → POST /api/mock-interviews/start
  ↓
Backend → mockInterview.service.js
  ↓
Gemini API → Generate 5 questions based on domain/difficulty
  ↓
Save MockInterview Model
  ↓
Return questions → Frontend displays
  ↓
User submits answer for each question
  ↓
POST /api/mock-interviews/:id/answer
  ↓
Gemini API → Evaluate answer quality
  ↓
Update MockInterview with evaluation
  ↓
After all questions → POST /api/mock-interviews/:id/complete
  ↓
Calculate overall score → Return to Frontend
```

### 3️⃣ Real-time Chat Flow

```
User A → Send message
  ↓
Frontend → Socket.IO emit "sendMessage"
  ↓
Backend → Socket.IO server receives
  ↓
Save to Chat Model (MongoDB)
  ↓
Socket.IO broadcast to room
  ↓
User B receives via Socket.IO
  ↓
Frontend updates chat UI instantly
```

## 🔐 Authentication Flow

```
User → Sign Up/Sign In (Clerk UI)
  ↓
Clerk → Generate JWT token
  ↓
Frontend → Store token in localStorage
  ↓
Frontend → Add to all API requests (Bearer header)
  ↓
Backend → auth.middleware.js verifies token
  ↓
Extract userId and role from token
  ↓
Attach to req.auth
  ↓
Route handler accesses req.auth.userId / req.auth.role
```

## 📦 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 | React framework with SSR |
| | React 18.3 | UI component library |
| | TypeScript | Type-safe JavaScript |
| | Tailwind CSS | Utility-first styling |
| | Clerk 5.0 | Authentication UI |
| | Axios | HTTP client |
| | Socket.IO Client | WebSocket client |
| **Backend** | Node.js 22 | JavaScript runtime |
| | Express.js | Web framework |
| | Socket.IO 4.6 | WebSocket server |
| | Mongoose 8 | MongoDB ODM |
| | Clerk SDK | Auth verification |
| **AI** | Google Gemini | Resume parsing, Q&A |
| | pdf-parse | PDF text extraction |
| | mammoth | DOCX conversion |
| **Database** | MongoDB | Document database |
| **Auth** | Clerk | User management |
| **Optional** | Google Calendar | Meeting scheduling |
| | Nodemailer | Email notifications |
| | Twilio | WhatsApp messages |
| | Zoom | Video meetings |

## 🎯 Key Features Mapping

| Feature | Backend Service | Frontend Page | Database Model |
|---------|----------------|---------------|----------------|
| Resume Parsing | resumeParser.service.js | Upload Resume | Resume Model |
| Job Matching | jobMatching.service.js | Matches List | Match Model |
| Scheduling | scheduler.service.js | Interview Calendar | Interview Model |
| Mock Interview | mockInterview.service.js | Mock Interview | MockInterview Model |
| Real-time Chat | Socket.IO + Chat Routes | Chat Interface | Chat Model |
| Analytics | Analytics Routes | Dashboard Stats | All Models |
| Notifications | notification.service.js | Global Alerts | N/A |

## 🚀 API Endpoint Summary

**Total**: 50+ endpoints across 8 route groups

| Route Group | Endpoints | Methods |
|------------|-----------|---------|
| /api/auth | 2 | POST, GET |
| /api/resumes | 5 | POST, GET |
| /api/jobs | 6 | POST, GET, PUT, DELETE |
| /api/matches | 7 | GET, POST, PATCH |
| /api/interviews | 6 | POST, GET, PATCH |
| /api/mock-interviews | 5 | POST, GET |
| /api/chat | 5 | GET, POST, PATCH |
| /api/analytics | 3 | GET |

## 📈 Database Schema Overview

**7 Mongoose Models** with relationships:

```
Candidate ──┐
            ├──> Match <──┐
Job ────────┘             │
                          ├──> Interview
Resume ──> Candidate      │
                          │
Chat <────────────────────┘

MockInterview ──> Candidate
```

## 🎨 UI Components Structure

```
app/
├── page.tsx (Landing - Public)
├── sign-in/ (Clerk Auth)
├── sign-up/ (Clerk Auth)
├── onboarding/ (Role Selection)
└── dashboard/
    ├── page.tsx (Router)
    ├── candidate/
    │   └── page.tsx (Matches, Interviews, Analytics)
    └── recruiter/
        └── page.tsx (Jobs, Candidates, Stats)
```

## 🔄 State Management

- **Authentication**: Clerk hooks (`useUser`, `useAuth`)
- **API Calls**: Axios with interceptors
- **Real-time**: Socket.IO event listeners
- **Local State**: React `useState` + `useEffect`
- **Token Storage**: localStorage (`clerk-token`)

## 🌐 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 5000 | http://localhost:5000 |
| MongoDB | 27017 | mongodb://127.0.0.1:27017 |
| Socket.IO | 5000 | ws://localhost:5000 |

## ✅ System Health Check

```bash
# Backend health
curl http://localhost:5000/health

# Frontend access
curl http://localhost:3000

# MongoDB connection
mongosh mongodb://127.0.0.1:27017/ai-resume
```

---

**Project Status**: ✅ Fully Operational  
**Last Updated**: Today  
**Version**: 1.0.0
