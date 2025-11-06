# Frontend

A Next.js 15 (App Router) app with TypeScript, Tailwind CSS, Clerk authentication, Recharts, and smooth page animations using Framer Motion.

## Stack
- Next.js 15 + React 18
- TypeScript
- Tailwind CSS
- Clerk (Auth)
- Axios API client (`frontend/lib/api.ts`)
- Framer Motion (page transitions) and custom `LoadingSpinner`

## Setup
1. Install dependencies
   ```powershell
   cd frontend
   npm install
   ```
2. Environment variables (create `frontend/.env.local`)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=`
   - `CLERK_SECRET_KEY=` (server actions if used)
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`
3. Run dev server
   ```powershell
   npm run dev
   ```
   - Default: http://localhost:3000

## Project Highlights
- Recruiter workflow: find candidates → view profile → schedule interview → messages → analytics
- Candidate workflow: upload resume → matches → apply/express interest → interviews
- New: Consistent loading UX and animated transitions
  - Components: `components/LoadingSpinner.tsx`, `components/PageTransition.tsx`
  - Global route loading UI: `app/loading.tsx`

## Key Pages
- `/dashboard/candidate`, `/dashboard/recruiter`
- `/candidates`, `/candidates/[id]`
- `/interviews/schedule` (recruiter)
- `/messages` (demo UI, ready for backend)
- `/analytics` (Recharts-based)
- `/matches` (candidate matches)
- `/profile` (applied jobs section included)

## Scheduling Interviews (important)
- Frontend builds the request in `app/interviews/schedule/page.tsx`:
  1) Find existing match via `apiClient.getAllMatches()`
  2) If none, create on-demand via `apiClient.createManualMatch(candidateId, jobId)` which calls `POST /api/matches/manual`
  3) Call `apiClient.scheduleInterview({ matchId, scheduledDateTime, duration, type, meetingPlatform, location?, notes? })`
- Meeting platform auto-detected from link when `type === 'video'` (zoom/meet/teams/other).

## API Client Tips (`frontend/lib/api.ts`)
- Base URL uses `NEXT_PUBLIC_API_BASE_URL`.
- Includes helper methods like `getCandidateMatches`, `getAllMatches`, `updateMatchStatus`, `scheduleInterview`, `createManualMatch` (added).
- Always set token after Clerk auth: `apiClient.setToken(await getToken())`.

## Styling & Animations
- Tailwind for design system.
- Framer Motion wrappers:
  - `PageTransition` for page-level mount/unmount animations
  - `FadeTransition`, `SlideFromRight`, `ScaleTransition` variants
- Loading states:
  - Full-screen overlay `LoadingSpinner` for initial loads and heavy fetches
  - Added to Dashboards, Profile, Matches (and global `app/loading.tsx`)

## Troubleshooting
- If you see "Failed to create candidate-job match":
  - Ensure the candidate and job exist and recruiter owns the job
  - Backend must be running on port 5000
  - The new endpoint `/api/matches/manual` will create the match
- If API shape errors like `matchesResponse.data.find is not a function`:
  - Use `response.data.matches || response.data || []` pattern
- If frontend can’t reach backend:
  - Verify `NEXT_PUBLIC_API_BASE_URL`
  - Check CORS settings on backend

## Deployment
- Vercel for frontend works out of the box.
- Set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend’s `/api` URL.
- Add Clerk keys in Vercel project settings.

## Quick QA Flow
1) Start backend (5000) and frontend (3000)
2) Sign in as recruiter → create job
3) Sign in as candidate → upload resume → see matches
4) As recruiter → open candidate profile → Schedule Interview
5) Confirm interview appears in both recruiter and candidate dashboards
