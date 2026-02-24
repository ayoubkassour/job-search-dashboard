import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Job = {
  id: number;
  company: string;
  job_title: string;
  job_url: string;
  key_requirements: string | null;
  recruiter_name: string;
  recruiter_linkedin: string;
  hiring_manager_name: string;
  hiring_manager_linkedin: string;
  tailored_resume: string | null;
  status: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
  source: "manual" | "tracker";
  discovered_at: string;
  created_at: string;
  updated_at: string;
};

export type TrackerRun = {
  id: number;
  run_at: string;
  jobs_found: number;
  new_jobs_added: number;
  status: string;
  log: string | null;
};
