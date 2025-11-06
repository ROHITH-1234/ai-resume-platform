# Backend

A Node.js/Express API with MongoDB for the AI Resume Platform. Secured with role-based middleware (candidate, recruiter, admin) and consumed by the Next.js frontend.

## Stack
- Node.js + Express
- MongoDB (Atlas)
- Authentication: Clerk-backed JWT via custom middleware
- Port: 5000 (base path: `/api`)

## Setup
1. Install dependencies
   - Windows PowerShell:
     ```powershell
     cd backend
     npm install
     ```
2. Environment variables (create `backend/.env`)
   - `MONGODB_URI=` your MongoDB connection string
   - `CLERK_JWT_PUBLIC_KEY=` (or your JWT verification secret, depending on your auth middleware)
   - `CORS_ORIGIN=http://localhost:3000`
   - `PORT=5000` (optional; defaults to 5000)
3. Run dev server
   ```powershell
   npm run dev
   ```
   - If port 5000 is busy:
     ```powershell
     netstat -ano | findstr :5000
     taskkill /PID <pid> /F
     ```

## Auth Model
- `requireAuth` populates `req.user` with `{ id, role, email }`.
- `requireRole('recruiter' | 'candidate' | 'admin')` gates endpoints.
- Frontend must send `Authorization: Bearer <token>` header.

## Key Routes (summary)
Base prefix: `/api`

### Candidates (`/candidates`)
- `GET /` (recruiter, admin): list candidates with filters
- `GET /me` (candidate): current profile
- `GET /:id` (recruiter, admin): candidate by id
- `PUT /me` (candidate): update own profile
- `GET /stats/overview` (recruiter, admin): simple stats

### Matches (`/matches`)
- `GET /` (recruiter, admin): all matches across your jobs
- `GET /candidate` (candidate): matches for current candidate
- `GET /job/:jobId` (recruiter, admin): matches for a job
- `POST /candidate/trigger` (candidate): run matching for candidate
- `POST /job/:jobId/trigger` (recruiter, admin): run matching for job
- `PATCH /:matchId/status` (recruiter, admin): update status
- `PATCH /:matchId/interest` (candidate): express interest
- `POST /manual` (recruiter, admin): create or return a match for `{ candidateId, jobId }`
  - Calculates a score (best effort) and returns populated `match`.

### Interviews (`/interviews`)
- `POST /` (recruiter, admin): schedule interview
  - Body:
    ```json
    {
      "matchId": "<id>",
      "scheduledDateTime": "2025-11-05T10:00:00.000Z",
      "duration": 30,
      "type": "video" | "in-person" | "phone",
      "meetingPlatform": "zoom" | "google-meet" | "microsoft-teams" | "in-person" | "phone" | "other",
      "location": "<optional if in-person>",
      "notes": "<optional>"
    }
    ```
- `GET /` (role-based): current user’s interviews (candidate or recruiter)
- `PATCH /:interviewId/status` (recruiter, admin): update status
- `PATCH /:interviewId/reschedule` (recruiter, admin): change time
- `POST /:interviewId/feedback` (recruiter, admin): submit feedback

### Chat (`/chat`)
- `POST /match/:matchId` (auth): create/get chat thread for a match

## Data Hints
- `Match` links `candidateId` and `jobId` and stores `matchScore`, `status`, `candidateInterested`.
- `Interview` stores `matchId`, `candidateId`, `jobId`, `recruiterId`, time fields and platform.

## Troubleshooting
- 403 Not authorized: ensure `req.user.role` matches route requirements and the recruiter owns the job.
- 404 Match not found: create via `POST /api/matches/manual` before scheduling.
- ECONNREFUSED: backend not running on 5000; start the server or adjust `NEXT_PUBLIC_API_BASE_URL` on the frontend.
- Port in use: free port with `netstat`/`taskkill` (see above).

## Deployment (outline)
- Provide environment variables and start script `npm start` (or `node src/server.js`).
- Common hosts: Render/Railway/Azure App Service. Expose port 5000.
- Allow CORS origin for your deployed frontend.
