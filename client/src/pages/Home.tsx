import { useState } from "react";
import { Plus, Radar, LogOut } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useAuth } from "@/lib/auth";
import { StatsBar } from "@/components/StatsBar";
import { SearchFilter } from "@/components/SearchFilter";
import { JobTable } from "@/components/JobTable";
import { JobDetailPanel } from "@/components/JobDetailPanel";
import { AddJobDialog } from "@/components/AddJobDialog";
import { TrackerPanel } from "@/components/TrackerPanel";
import type { Job } from "@/lib/supabase";

export function Home() {
  const { signOut, newJobsThreshold } = useAuth();
  const {
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
    refetch,
  } = useJobs();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="border-b border-[#334155] bg-[#0F172A]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-[1600px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Radar className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100 leading-tight">
                  Job Search Command Center
                </h1>
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                  Singapore PM Roles
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddDialogOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 font-mono text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Job
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-lg border border-[#334155] px-3 py-2 font-mono text-xs text-slate-400 hover:bg-[#1E293B] hover:text-slate-200 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-4 space-y-4">
        {/* Stats */}
        <StatsBar />

        {/* Tracker */}
        <TrackerPanel onTrackerComplete={refetch} />

        {/* Search & Filter */}
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sourceFilter={sourceFilter}
          onSourceChange={setSourceFilter}
        />

        {/* Main Content: Table + Detail Panel */}
        <div className="flex gap-0 rounded-lg overflow-hidden border border-[#334155]">
          {/* Table */}
          <div
            className={`transition-all duration-300 overflow-auto ${
              selectedJob ? "w-[55%]" : "w-full"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : (
              <JobTable
                jobs={jobs}
                selectedId={selectedJob?.id ?? null}
                newJobsThreshold={newJobsThreshold}
                onSelect={(job) =>
                  setSelectedJob(selectedJob?.id === job.id ? null : job)
                }
                onStatusChange={(id, status) => updateJob(id, { status: status as Job["status"] })}
                onDelete={(id) => {
                  deleteJob(id);
                  if (selectedJob?.id === id) setSelectedJob(null);
                }}
              />
            )}
          </div>

          {/* Detail Panel */}
          {selectedJob && (
            <div className="w-[45%] min-h-[500px]">
              <JobDetailPanel
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                onUpdate={updateJob}
              />
            </div>
          )}
        </div>
      </main>

      {/* Add Job Dialog */}
      <AddJobDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={addJob}
      />
    </div>
  );
}
