import { useState, useEffect } from "react";
import { Bot, Play, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface TrackerRun {
  id: number;
  run_at: string;
  jobs_found: number;
  new_jobs_added: number;
  status: string;
  log: string | null;
}

interface TrackerPanelProps {
  onTrackerComplete: () => void;
}

export function TrackerPanel({ onTrackerComplete }: TrackerPanelProps) {
  const [runs, setRuns] = useState<TrackerRun[]>([]);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/tracker/runs`)
      .then((r) => r.json())
      .then(setRuns)
      .catch(() => {});
  }, []);

  const triggerRun = async () => {
    setRunning(true);
    try {
      const res = await fetch(`${API_BASE}/tracker/run`, { method: "POST" });
      const result = await res.json();
      // Refresh runs
      const runsRes = await fetch(`${API_BASE}/tracker/runs`);
      const newRuns = await runsRes.json();
      setRuns(newRuns);
      onTrackerComplete();
    } catch (err) {
      console.error("Tracker run failed:", err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#334155] bg-[#1E293B]">
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-purple-400" />
          <span className="font-mono text-xs font-medium text-slate-300">
            AI Job Tracker
          </span>
          {runs.length > 0 && (
            <span className="font-mono text-[10px] text-slate-500">
              Last run: {new Date(runs[0].run_at).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerRun();
            }}
            disabled={running}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 font-mono text-xs text-purple-400 hover:bg-purple-500/20 disabled:opacity-50 transition-colors"
          >
            {running ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Run Now
              </>
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#334155] px-4 py-3">
          <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Run History
          </h4>
          {runs.length === 0 ? (
            <p className="text-xs text-slate-600 italic">No runs yet</p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="flex items-start gap-2 rounded border border-[#334155] bg-[#0F172A] px-3 py-2"
                >
                  {run.status === "success" ? (
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 text-red-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-600" />
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(run.run_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-slate-400">
                      Found: {run.jobs_found} | New: {run.new_jobs_added}
                    </div>
                    {run.log && (
                      <pre className="mt-1 whitespace-pre-wrap text-[10px] text-slate-600 max-h-[80px] overflow-y-auto">
                        {run.log}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
