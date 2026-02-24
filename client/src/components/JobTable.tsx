import { ExternalLink, Linkedin, Trash2, ChevronRight } from "lucide-react";
import type { Job } from "@/lib/supabase";
import { StatusBadge, SourceBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

const statuses = ["Saved", "Applied", "Interview", "Offer", "Rejected"] as const;

interface JobTableProps {
  jobs: Job[];
  selectedId: number | null;
  onSelect: (job: Job) => void;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

export function JobTable({
  jobs,
  selectedId,
  onSelect,
  onStatusChange,
  onDelete,
}: JobTableProps) {
  return (
    <div className="overflow-auto rounded-lg border border-[#334155]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[#334155] bg-[#1E293B]">
          <tr>
            <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
              Company / Role
            </th>
            <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
              Contacts
            </th>
            <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
              Status
            </th>
            <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
              Source
            </th>
            <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#334155]">
          {jobs.map((job) => (
            <tr
              key={job.id}
              onClick={() => onSelect(job)}
              className={cn(
                "cursor-pointer transition-colors hover:bg-[#1E293B]",
                selectedId === job.id && "bg-[#1E293B] border-l-2 border-l-emerald-500"
              )}
            >
              <td className="px-4 py-3">
                <div className="font-semibold text-slate-100">{job.company}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{job.job_title}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  {job.recruiter_name !== "Not Found" && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 truncate max-w-[100px]">
                        {job.recruiter_name}
                      </span>
                      {job.recruiter_linkedin !== "Not Found" && (
                        <a
                          href={job.recruiter_linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Linkedin className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                  {job.hiring_manager_name !== "Not Found" && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 truncate max-w-[100px]">
                        {job.hiring_manager_name}
                      </span>
                      {job.hiring_manager_linkedin !== "Not Found" && (
                        <a
                          href={job.hiring_manager_linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Linkedin className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                  {job.recruiter_name === "Not Found" &&
                    job.hiring_manager_name === "Not Found" && (
                      <span className="text-xs text-slate-600 italic">No contacts</span>
                    )}
                </div>
              </td>
              <td className="px-4 py-3">
                <select
                  value={job.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    onStatusChange(job.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border border-transparent bg-transparent font-mono text-xs text-slate-300 outline-none hover:border-[#334155] cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s} className="bg-[#1E293B]">{s}</option>
                  ))}
                </select>
                <div className="mt-1">
                  <StatusBadge status={job.status} />
                </div>
              </td>
              <td className="px-4 py-3">
                <SourceBadge source={job.source} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded p-1.5 text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                    title="Apply Now"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(job.id);
                    }}
                    className="rounded p-1.5 text-slate-500 hover:bg-red-400/10 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </div>
              </td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-slate-500 font-mono text-sm">
                No jobs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
