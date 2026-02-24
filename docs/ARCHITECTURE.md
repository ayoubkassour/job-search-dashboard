# Job Search Command Center - Architecture

## System Overview

```
                                    +------------------+
                                    |   You (Browser)  |
                                    +--------+---------+
                                             |
                              HTTPS (authenticated)
                                             |
                    +------------------------+------------------------+
                    |                                                 |
          +---------v----------+                          +-----------v-----------+
          |   Vercel (Frontend)|                          |   Render (Backend)    |
          |                    |                          |                       |
          |  React + Vite      |    HTTPS API calls       |  Express.js Server    |
          |  Tailwind CSS      +------------------------->+                       |
          |  Supabase Auth     |   /api/jobs, /api/stats  |  node-cron (8am SGT)  |
          |                    |   /api/tracker/*          |  Job Tracker Service  |
          +--------+-----------+                          +-----------+-----------+
                   |                                                  |
                   |  Auth (login/signup)                              |
                   |                                                  |
          +--------v--------------------------------------------------v----------+
          |                        Supabase                                      |
          |                                                                      |
          |  +------------------+  +-------------------+  +------------------+   |
          |  | PostgreSQL DB    |  | Authentication    |  | Row Level        |   |
          |  |                  |  |                   |  | Security (RLS)   |   |
          |  | - jobs table     |  | - Email/password  |  | - Auth users     |   |
          |  | - tracker_runs   |  | - Session mgmt   |  |   can CRUD       |   |
          |  +------------------+  +-------------------+  +------------------+   |
          +----------------------------------------------------------------------+
                                             |
                              (used by Job Tracker Service)
                                             |
                    +------------------------+------------------------+
                    |                                                 |
          +---------v----------+                          +-----------v-----------+
          |   Serper API       |                          |   Anthropic API       |
          |                    |                          |                       |
          |  Google Search     |                          |  Claude Sonnet 4.5    |
          |  5 queries/run     |                          |  Job analysis         |
          |  ~50 results       |                          |  Contact enrichment   |
          +--------------------+                          +-----------------------+
```

## Services & What They Do

### 1. Vercel (Frontend Hosting)
- **URL**: https://job-search-dashboard-ayoubkassours-projects.vercel.app
- **What**: Hosts the React single-page application
- **Stack**: React 19, Vite 7, Tailwind CSS 4, TypeScript
- **Auth**: Supabase Auth (email/password login)
- **Cost**: Free tier

### 2. Render (Backend Hosting)
- **URL**: https://job-search-dashboard-q1j4.onrender.com
- **What**: Runs the Express.js API server + cron scheduler
- **Stack**: Express 5, TypeScript, tsx runtime
- **Cron**: Runs AI Job Tracker daily at 8:00 AM SGT
- **Cost**: Free tier (sleeps after 15 min inactivity, cold starts ~30s)

### 3. Supabase (Database + Auth)
- **URL**: https://csowtcivkxmcelazfcso.supabase.co
- **What**: PostgreSQL database + user authentication
- **Tables**: `jobs` (all job listings), `tracker_runs` (tracker history)
- **Auth**: Email/password, session management
- **RLS**: Enabled - authenticated users have full access
- **Cost**: Free tier (500MB DB, 50K requests/month)

### 4. Serper API (Web Search)
- **What**: Google Search API used by the AI Tracker to find job postings
- **Queries per run**: 5 (job search) + 2 per new job (contact search)
- **Cost**: Free tier (2,500 searches/month)

### 5. Anthropic API (AI Analysis)
- **Model**: Claude Sonnet 4.5
- **What**: Analyzes search results to extract relevant jobs, finds recruiter/HM contacts
- **Calls per run**: 1 (job extraction) + 1 per new job (contact extraction)
- **Cost**: ~$0.10-0.15 per tracker run

## Database Schema

### `jobs` table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment ID |
| company | TEXT | Company name |
| job_title | TEXT | Role title |
| job_url | TEXT | Application link |
| key_requirements | TEXT | Comma-separated requirements |
| recruiter_name | TEXT | Recruiter name (or "Not Found") |
| recruiter_linkedin | TEXT | Recruiter LinkedIn URL |
| hiring_manager_name | TEXT | HM name (or "Not Found") |
| hiring_manager_linkedin | TEXT | HM LinkedIn URL |
| tailored_resume | TEXT | Markdown resume for this role |
| status | TEXT | Saved, Applied, Interview, Offer, Rejected |
| source | TEXT | "manual" or "tracker" |
| discovered_at | TIMESTAMPTZ | When the job was found |
| created_at | TIMESTAMPTZ | Row creation time |
| updated_at | TIMESTAMPTZ | Last update time |

### `tracker_runs` table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment ID |
| run_at | TIMESTAMPTZ | When the run executed |
| jobs_found | INTEGER | Total search results |
| new_jobs_added | INTEGER | New jobs inserted |
| status | TEXT | "success" or "error" |
| log | TEXT | Detailed run log |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | List jobs (supports ?search, ?status, ?source) |
| POST | /api/jobs | Create a new job |
| PUT | /api/jobs/:id | Update a job (status, details) |
| DELETE | /api/jobs/:id | Delete a job |
| GET | /api/stats | Dashboard statistics |
| POST | /api/tracker/run | Manually trigger AI tracker |
| GET | /api/tracker/runs | Tracker run history |

## AI Job Tracker Pipeline

```
1. SEARCH (Serper API)
   5 queries x 10 results = ~50 search results
   ├── "Senior Product Manager Singapore fintech"
   ├── "Lead Product Manager Singapore"
   ├── "Head of Product Singapore"
   ├── "VP Product Singapore payments"
   └── "Product Manager Singapore marketplace"

2. ANALYZE (Claude Sonnet 4.5)
   Filters results against Ayoub's profile:
   ├── 12+ years PM experience
   ├── Domains: fintech, marketplace, BNPL, insurance, distribution
   ├── Seniority: Head/VP/Lead/Senior PM
   └── Preference: startups, growth-stage, Singapore

3. ENRICH CONTACTS (per new job)
   For each new job found:
   ├── Search: "{company} recruiter Singapore LinkedIn"
   ├── Search: "{company} Head/VP/Director Product Singapore LinkedIn"
   └── Claude extracts names + LinkedIn URLs

4. INSERT into Supabase
   ├── Deduplication by URL or company+title match
   ├── source: "tracker"
   └── status: "Saved"
```

## File Structure

```
job-search-dashboard/
├── docs/
│   ├── ARCHITECTURE.md          # This file
│   └── CHANGELOG.md             # Daily changes log
├── client/                      # Frontend (React + Vite)
│   ├── index.html
│   └── src/
│       ├── main.tsx             # Entry point
│       ├── App.tsx              # Auth gate (login vs dashboard)
│       ├── index.css            # Tailwind + Command Center theme
│       ├── vite-env.d.ts        # TypeScript env declarations
│       ├── lib/
│       │   ├── supabase.ts      # Supabase client + types
│       │   ├── auth.tsx         # Auth context provider
│       │   └── utils.ts         # cn() utility
│       ├── hooks/
│       │   └── useJobs.ts       # Jobs CRUD + stats hooks
│       ├── data/
│       │   └── seed-jobs.ts     # 15 seed jobs (fallback)
│       ├── pages/
│       │   ├── Home.tsx         # Main dashboard
│       │   └── Login.tsx        # Login/signup page
│       └── components/
│           ├── StatsBar.tsx     # Top metrics pills
│           ├── SearchFilter.tsx # Search + filters
│           ├── JobTable.tsx     # Main job table
│           ├── JobDetailPanel.tsx # Slide-in detail view
│           ├── StatusBadge.tsx  # Status + source badges
│           ├── AddJobDialog.tsx # Add job modal
│           └── TrackerPanel.tsx # AI tracker UI
├── server/                      # Backend (Express)
│   ├── index.ts                 # API routes + cron scheduler
│   ├── seed-jobs.ts             # Seed data (server-side)
│   ├── tsconfig.json
│   └── services/
│       └── job-tracker.ts       # AI tracker (Serper + Claude)
├── supabase/
│   └── migrations/
│       ├── 001_init.sql         # Schema + seed data
│       └── 002_rls.sql          # Row Level Security policies
├── .env                         # Local env vars (not in git)
├── .env.example                 # Env template
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── vercel.json                  # Vercel build config
└── render.yaml                  # Render deploy config
```

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| SUPABASE_URL | Render | Database connection |
| SUPABASE_ANON_KEY | Render | Database auth |
| ANTHROPIC_API_KEY | Render | Claude API for job analysis |
| SERPER_API_KEY | Render | Google search for job discovery |
| VITE_SUPABASE_URL | Vercel | Frontend Supabase connection |
| VITE_SUPABASE_ANON_KEY | Vercel | Frontend Supabase auth |
| VITE_API_URL | Vercel | Backend API URL |

## Monthly Cost Estimate

| Service | Cost |
|---------|------|
| Vercel | Free |
| Render | Free |
| Supabase | Free |
| Serper API | Free (within 2,500/month) |
| Anthropic API | ~$3-5/month |
| **Total** | **~$3-5/month** |
