import { useState, useEffect, useCallback } from "react";
import type { Job } from "@/lib/supabase";
import { seedJobs } from "@/data/seed-jobs";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const STATUS_PRIORITY: Record<string, number> = {
  Offer: 0,
  Interview: 1,
  Applied: 2,
  Saved: 3,
  Rejected: 4,
};

function sortByStatus(jobs: Job[]): Job[] {
  return [...jobs].sort(
    (a, b) => (STATUS_PRIORITY[a.status] ?? 5) - (STATUS_PRIORITY[b.status] ?? 5)
  );
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (sourceFilter !== "All") params.set("source", sourceFilter);
      params.set("sort", "discovered");

      const res = await fetch(`${API_BASE}/jobs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setJobs(data);
    } catch {
      // Fallback to seed data if API unavailable
      let filtered = [...seedJobs];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (j) =>
            j.company.toLowerCase().includes(q) ||
            j.job_title.toLowerCase().includes(q)
        );
      }
      if (statusFilter !== "All") {
        filtered = filtered.filter((j) => j.status === statusFilter);
      }
      if (sourceFilter !== "All") {
        filtered = filtered.filter((j) => j.source === sourceFilter);
      }
      setJobs(sortByStatus(filtered));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateJob = async (id: number, updates: Partial<Job>) => {
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setJobs((prev) => sortByStatus(prev.map((j) => (j.id === id ? updated : j))));
      return updated;
    } catch {
      // Optimistic update for offline mode
      setJobs((prev) =>
        sortByStatus(prev.map((j) => (j.id === id ? { ...j, ...updates } : j)))
      );
    }
  };

  const addJob = async (job: Partial<Job>) => {
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      if (!res.ok) throw new Error("Failed to add");
      const newJob = await res.json();
      setJobs((prev) => [newJob, ...prev]);
      return newJob;
    } catch {
      const newJob = {
        ...job,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        discovered_at: new Date().toISOString(),
      } as Job;
      setJobs((prev) => [newJob, ...prev]);
      return newJob;
    }
  };

  const deleteJob = async (id: number) => {
    try {
      await fetch(`${API_BASE}/jobs/${id}`, { method: "DELETE" });
    } catch {
      // continue anyway
    }
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  return {
    jobs,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    updateJob,
    addJob,
    deleteJob,
    refetch: fetchJobs,
  };
}

export function useStats() {
  const [stats, setStats] = useState({
    total: 0,
    saved: 0,
    applied: 0,
    interviews: 0,
    offers: 0,
    rejected: 0,
    trackerFinds: 0,
  });

  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {
        // Fallback from seed data
        setStats({
          total: seedJobs.length,
          saved: seedJobs.filter((j) => j.status === "Saved").length,
          applied: seedJobs.filter((j) => j.status === "Applied").length,
          interviews: seedJobs.filter((j) => j.status === "Interview").length,
          offers: seedJobs.filter((j) => j.status === "Offer").length,
          rejected: seedJobs.filter((j) => j.status === "Rejected").length,
          trackerFinds: seedJobs.filter((j) => j.source === "tracker").length,
        });
      });
  }, []);

  return stats;
}
