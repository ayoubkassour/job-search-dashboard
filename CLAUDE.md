# Job Search Command Center

## Project Overview
AI-powered job search dashboard for tracking PM roles in Singapore. Built for Ayoub Kassour.

## Tech Stack
- **Frontend**: React 19, Vite 7, Tailwind CSS 4, TypeScript — hosted on Vercel
- **Backend**: Express 5, TypeScript, tsx runtime — hosted on Render (free tier)
- **Database**: Supabase PostgreSQL + Auth (email/password) + Row Level Security
- **AI Tracker**: Serper API (Google search) + Anthropic Claude Sonnet 4.5 (analysis)
- **Scheduler**: node-cron runs tracker daily at 8:00 AM SGT
- **Package manager**: pnpm

## Deployed URLs
- Frontend: https://job-search-dashboard-ayoubkassours-projects.vercel.app
- Backend: https://job-search-dashboard-q1j4.onrender.com
- Supabase: https://csowtcivkxmcelazfcso.supabase.co
- GitHub: https://github.com/ayoubkassour/job-search-dashboard

## Project Structure
```
client/src/          → React frontend
  components/        → JobTable, JobDetailPanel, StatsBar, SearchFilter, AddJobDialog, StatusBadge, TrackerPanel
  pages/             → Home.tsx (dashboard), Login.tsx
  hooks/useJobs.ts   → CRUD + stats hooks with retry logic for Render cold starts
  lib/auth.tsx       → Supabase Auth context (tracks newJobsThreshold for NEW badges)
  lib/supabase.ts    → Supabase client
  data/seed-jobs.ts  → 15 seed jobs (offline fallback)
server/
  index.ts           → Express API routes + cron scheduler
  services/job-tracker.ts → AI tracker pipeline (search → analyze → enrich contacts)
  seed-jobs.ts       → Server-side seed data
supabase/migrations/ → SQL schema (001_init.sql, 002_rls.sql)
docs/                → ARCHITECTURE.md, CHANGELOG.md
```

## Key Patterns
- Render free tier sleeps after 15 min → `fetchWithRetry()` in useJobs.ts handles 502 cold starts
- Supabase ANON_KEY sanitized with `.replace(/\s+/g, "")` in server/index.ts (Render newline bug)
- Status priority sorting: Offer > Interview > Applied > Saved > Rejected
- NEW badge: compares job `discovered_at` against `last_seen_at` stored in localStorage
- Server falls back to in-memory seed data when Supabase credentials not configured
- Contact enrichment: 2 Serper searches + 1 Claude call per new tracker job

## Environment Variables
- Render: SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, SERPER_API_KEY
- Vercel: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL

## Commands
- `pnpm dev` — runs frontend + backend concurrently
- `pnpm build` — builds frontend to dist/client
- Source nvm before running: `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"`

## Documentation
- `docs/ARCHITECTURE.md` — full system architecture, services, DB schema, API endpoints
- `docs/CHANGELOG.md` — daily change history (keep this updated with every change)
