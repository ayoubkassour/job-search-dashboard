import { Briefcase, Send, MessageSquare, Trophy, Bot } from "lucide-react";
import { useStats } from "@/hooks/useJobs";

const statItems = [
  { key: "total", label: "Total", icon: Briefcase, color: "text-slate-300" },
  { key: "applied", label: "Applied", icon: Send, color: "text-blue-400" },
  { key: "interviews", label: "Interviews", icon: MessageSquare, color: "text-emerald-400" },
  { key: "offers", label: "Offers", icon: Trophy, color: "text-amber-400" },
  { key: "trackerFinds", label: "Tracker Finds", icon: Bot, color: "text-purple-400" },
] as const;

export function StatsBar() {
  const stats = useStats();

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      {statItems.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-2 rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 min-w-fit"
        >
          <item.icon className={`h-4 w-4 ${item.color}`} />
          <span className="font-mono text-xs text-slate-400">{item.label}</span>
          <span className={`font-mono text-sm font-semibold ${item.color}`}>
            {stats[item.key]}
          </span>
        </div>
      ))}
    </div>
  );
}
