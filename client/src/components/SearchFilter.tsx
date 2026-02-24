import { Search, Filter } from "lucide-react";

const statuses = ["All", "Saved", "Applied", "Interview", "Offer", "Rejected"];
const sources = ["All", "manual", "tracker"];

interface SearchFilterProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  sourceFilter: string;
  onSourceChange: (v: string) => void;
}

export function SearchFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sourceFilter,
  onSourceChange,
}: SearchFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search company or role..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-[#334155] bg-[#1E293B] py-2 pl-9 pr-3 font-mono text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 font-mono text-xs text-slate-300 outline-none focus:border-emerald-500/50"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => onSourceChange(e.target.value)}
          className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 font-mono text-xs text-slate-300 outline-none focus:border-emerald-500/50"
        >
          {sources.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Sources" : s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
