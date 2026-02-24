import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import cron from "node-cron";
import { runJobTracker } from "./services/job-tracker.js";
import { seedJobs, type SeedJob } from "./seed-jobs.js";

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

const hasSupabase = supabaseUrl.length > 0 && supabaseKey.length > 0;
let supabase: SupabaseClient | null = null;

if (hasSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("[DB] Connected to Supabase");
} else {
  console.log("[DB] No Supabase credentials — running with in-memory seed data");
}

// In-memory store for when Supabase is not configured
let memoryJobs: SeedJob[] = [...seedJobs];
let nextId = Math.max(...memoryJobs.map((j) => j.id)) + 1;
let memoryTrackerRuns: any[] = [];

// GET /api/jobs
app.get("/api/jobs", async (req, res) => {
  try {
    if (supabase) {
      const { search, status, source, sort } = req.query;
      let query = supabase.from("jobs").select("*");
      if (status && status !== "All") query = query.eq("status", status);
      if (source && source !== "All") query = query.eq("source", source);
      if (search) query = query.or(`company.ilike.%${search}%,job_title.ilike.%${search}%`);
      if (sort === "discovered") query = query.order("discovered_at", { ascending: false });
      else query = query.order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    } else {
      let filtered = [...memoryJobs];
      const { search, status, source } = req.query;
      if (search) {
        const q = (search as string).toLowerCase();
        filtered = filtered.filter(
          (j) => j.company.toLowerCase().includes(q) || j.job_title.toLowerCase().includes(q)
        );
      }
      if (status && status !== "All") filtered = filtered.filter((j) => j.status === status);
      if (source && source !== "All") filtered = filtered.filter((j) => j.source === source);
      res.json(filtered);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs
app.post("/api/jobs", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("jobs").insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } else {
      const newJob: SeedJob = {
        id: nextId++,
        ...req.body,
        recruiter_name: req.body.recruiter_name || "Not Found",
        recruiter_linkedin: req.body.recruiter_linkedin || "Not Found",
        hiring_manager_name: req.body.hiring_manager_name || "Not Found",
        hiring_manager_linkedin: req.body.hiring_manager_linkedin || "Not Found",
        status: req.body.status || "Saved",
        source: req.body.source || "manual",
        discovered_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memoryJobs.unshift(newJob);
      res.json(newJob);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/jobs/:id
app.put("/api/jobs/:id", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("jobs")
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq("id", req.params.id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } else {
      const id = parseInt(req.params.id);
      const idx = memoryJobs.findIndex((j) => j.id === id);
      if (idx === -1) return res.status(404).json({ error: "Not found" });
      memoryJobs[idx] = { ...memoryJobs[idx], ...req.body, updated_at: new Date().toISOString() };
      res.json(memoryJobs[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/jobs/:id
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    if (supabase) {
      const { error } = await supabase.from("jobs").delete().eq("id", req.params.id);
      if (error) throw error;
    } else {
      const id = parseInt(req.params.id);
      memoryJobs = memoryJobs.filter((j) => j.id !== id);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats
app.get("/api/stats", async (_req, res) => {
  try {
    let jobs: { status: string; source: string }[];
    if (supabase) {
      const { data, error } = await supabase.from("jobs").select("status, source");
      if (error) throw error;
      jobs = data;
    } else {
      jobs = memoryJobs;
    }
    res.json({
      total: jobs.length,
      saved: jobs.filter((j) => j.status === "Saved").length,
      applied: jobs.filter((j) => j.status === "Applied").length,
      interviews: jobs.filter((j) => j.status === "Interview").length,
      offers: jobs.filter((j) => j.status === "Offer").length,
      rejected: jobs.filter((j) => j.status === "Rejected").length,
      trackerFinds: jobs.filter((j) => j.source === "tracker").length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tracker/run
app.post("/api/tracker/run", async (_req, res) => {
  try {
    if (!supabase) {
      return res.json({ jobs_found: 0, new_jobs_added: 0, logs: ["No Supabase configured"] });
    }
    const result = await runJobTracker(supabase);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tracker/runs
app.get("/api/tracker/runs", async (_req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("tracker_runs")
        .select("*")
        .order("run_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      res.json(data);
    } else {
      res.json(memoryTrackerRuns);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule job tracker daily at 8am SGT
if (hasSupabase) {
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("[Tracker] Running scheduled job search at 8am SGT...");
      try {
        const result = await runJobTracker(supabase!);
        console.log("[Tracker] Completed:", result);
      } catch (err) {
        console.error("[Tracker] Failed:", err);
      }
    },
    { timezone: "Asia/Singapore" }
  );
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
