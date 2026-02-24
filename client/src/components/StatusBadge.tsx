import { cn } from "@/lib/utils";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Saved: { color: "text-slate-400 bg-slate-400/10 border-slate-400/20", dot: "bg-slate-400" },
  Applied: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", dot: "bg-blue-400" },
  Interview: { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  Offer: { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", dot: "bg-amber-400" },
  Rejected: { color: "text-red-400 bg-red-400/10 border-red-400/20", dot: "bg-red-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.Saved;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium",
        config.color
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {status}
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  return source === "tracker" ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/20 bg-purple-400/10 px-2 py-0.5 font-mono text-[10px] font-medium text-purple-400">
      <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
      AI
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-500">
      manual
    </span>
  );
}
