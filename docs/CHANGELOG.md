# Job Search Command Center - Changelog

All notable changes to this project are documented here.

---

## 2026-02-24 — Documentation & Polish

### Added
- `docs/ARCHITECTURE.md` — Full system architecture diagram, service descriptions, database schema, API endpoints, AI tracker pipeline, file structure, environment variables, and cost estimates
- `docs/CHANGELOG.md` — This file, tracking daily project history

### Changed
- Status-priority sorting: jobs now display in order Offer > Interview > Applied > Saved > Rejected
- Sorting applied on both server (`server/index.ts`) and client (`client/src/hooks/useJobs.ts`)
- Re-sorts automatically when a job's status changes inline
- All seed jobs reset to "Saved" status (both `client/src/data/seed-jobs.ts` and `server/seed-jobs.ts`)

---

## 2026-02-23 — Deployment & Authentication

### Added
- **Supabase Auth**: Email/password login with `AuthProvider` context (`client/src/lib/auth.tsx`)
- **Login page** (`client/src/pages/Login.tsx`) — dark-themed login/signup form
- **Auth gate** in `App.tsx` — renders Login or Home based on auth state
- **Sign Out** button in dashboard header
- **Row Level Security** (`supabase/migrations/002_rls.sql`) — authenticated users get full CRUD, anon role kept open for server-side tracker cron
- **Vercel deployment** — frontend hosted at `job-search-dashboard-ayoubkassours-projects.vercel.app`
- **Render deployment** — backend hosted at `job-search-dashboard-q1j4.onrender.com`
- `vercel.json` — build config (pnpm build, output dist/client, vite framework)
- `render.yaml` — Render service config

### Fixed
- **Render SUPABASE_ANON_KEY newline bug**: Key had `\n` inserted when pasted into Render env vars. Fixed with `.replace(/\s+/g, "")` in `server/index.ts`
- **Vercel blank page**: Root directory misconfigured. Fixed with `vercel.json` and correct build output path
- **CORS**: Updated to allow Vercel domain in `server/index.ts`
- **GitHub auth**: Switched from password to Personal Access Token (PAT) for git push

---

## 2026-02-22 — Contact Enrichment & AI Profile

### Added
- **Contact enrichment pipeline** in `server/services/job-tracker.ts`:
  - `findContacts()` function — 2 Serper searches per new job (recruiter + hiring manager)
  - Claude extracts names + LinkedIn URLs from search results
  - Only includes LinkedIn URLs that actually appear in search results (prevents fabrication)
- **Full candidate profile** in tracker's Claude prompt — updated with Ayoub's complete resume:
  - 12+ years PM experience
  - Roles at Livesport, Sinbad, Home Credit, HMD Global, Societe Generale
  - Domains: fintech, marketplace, BNPL, insurance, distribution, startups
  - Seniority targets: Head/VP/Lead/Senior PM
  - Location preference: Singapore, startups, growth-stage

### Changed
- Tracker Claude prompt updated from generic to profile-specific matching
- Added "distribution" and "startups" to experience domains

---

## 2026-02-21 — AI Job Tracker & Supabase Integration

### Added
- **AI Job Tracker service** (`server/services/job-tracker.ts`):
  - 5 search queries via Serper API targeting Singapore PM roles
  - Claude Sonnet 4.5 analyzes results and extracts structured job data
  - Deduplication by URL or company+title match
  - New jobs inserted with `source: "tracker"`, `status: "Saved"`
  - Results logged to `tracker_runs` table
- **Cron scheduler** — `node-cron` runs tracker daily at 8:00 AM SGT
- **Manual trigger** — `POST /api/tracker/run` endpoint
- **Tracker UI** (`client/src/components/TrackerPanel.tsx`) — expandable panel with run history and "Run Now" button
- **Supabase database connection**:
  - `client/src/lib/supabase.ts` — client initialization with graceful fallback
  - Server connects to Supabase PostgreSQL via `@supabase/supabase-js`
  - In-memory fallback when credentials not configured

### Database
- Ran `supabase/migrations/001_init.sql` in Supabase SQL Editor
- Created `jobs` table (15 columns) and `tracker_runs` table (5 columns)
- Seeded 15 original PM jobs

---

## 2026-02-20 — Project Foundation

### Added
- **Project scaffolding**: Vite + React 19 + TypeScript + Tailwind CSS 4
- **Dark "Command Center" theme**: `#0F172A` base, emerald accents, JetBrains Mono font
- **Express 5 backend** (`server/index.ts`):
  - Full REST API: GET/POST/PUT/DELETE `/api/jobs`, GET `/api/stats`
  - In-memory seed data fallback
- **Frontend components**:
  - `JobTable.tsx` — sortable table with inline status change, LinkedIn links, Apply Now buttons
  - `JobDetailPanel.tsx` — animated slide-in panel with 3 tabs (Requirements, Resume, Contacts)
  - `StatsBar.tsx` — top metrics pills (Total, Saved, Applied, Interviews, Offers, Tracker Finds)
  - `SearchFilter.tsx` — search input + status/source filter dropdowns
  - `AddJobDialog.tsx` — form dialog for manual job entry
  - `StatusBadge.tsx` — monospaced dot-indicator badges for status and source
  - `TrackerPanel.tsx` — AI tracker results and history UI
- **Seed data** — 15 PM jobs across Singapore fintech companies (Grab, Shopee, Stripe, Wise, GoTo, Revolut, Sea Money, Ant Group, Standard Chartered, Endowus, Funding Societies, Xendit, Aspire, Fazz, Atome)
- **Hooks** (`client/src/hooks/useJobs.ts`): `useJobs()` for CRUD operations, `useStats()` for dashboard metrics
- **Environment setup**: Node.js v24.13.1 via nvm, pnpm package manager

### Configuration
- `package.json` with `"type": "module"`, concurrently for dev mode
- `vite.config.ts` with path aliases, API proxy, Tailwind plugin
- `tsconfig.json` for both client and server
- `.env.example` template
- `.gitignore` for node_modules, dist, .env
