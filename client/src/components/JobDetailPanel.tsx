import { X, ExternalLink, Linkedin, FileText, Users, ClipboardList } from "lucide-react";
import { useState } from "react";
import type { Job } from "@/lib/supabase";
import { StatusBadge, SourceBadge } from "./StatusBadge";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

interface JobDetailPanelProps {
  job: Job | null;
  onClose: () => void;
  onUpdate: (id: number, updates: Partial<Job>) => void;
}

type Tab = "requirements" | "resume" | "contacts";

export function JobDetailPanel({ job, onClose, onUpdate }: JobDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("requirements");

  if (!job) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "requirements", label: "Requirements", icon: <ClipboardList className="h-4 w-4" /> },
    { id: "resume", label: "Tailored Resume", icon: <FileText className="h-4 w-4" /> },
    { id: "contacts", label: "Contacts", icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key={job.id}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="flex h-full flex-col overflow-hidden border-l border-[#334155] bg-[#0F172A]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#334155] p-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-slate-100 truncate">{job.company}</h2>
              <SourceBadge source={job.source} />
            </div>
            <p className="font-mono text-sm text-slate-400">{job.job_title}</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={job.status} />
              <a
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Apply
              </a>
            </div>
            <p className="mt-2 font-mono text-[10px] text-slate-600">
              Discovered {new Date(job.discovered_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#334155]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-emerald-500 text-emerald-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "requirements" && (
            <div>
              <h3 className="mb-3 font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                Key Requirements
              </h3>
              {job.key_requirements ? (
                <div className="space-y-2">
                  {job.key_requirements.split(",").map((req, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2"
                    >
                      <span className="mt-0.5 font-mono text-xs text-emerald-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-slate-300">{req.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic">No requirements listed</p>
              )}
            </div>
          )}

          {activeTab === "resume" && (
            <div>
              <h3 className="mb-3 font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                Tailored Resume
              </h3>
              {job.tailored_resume ? (
                <div className="prose prose-sm prose-invert max-w-none rounded-lg border border-[#334155] bg-[#1E293B] p-4 prose-headings:text-slate-200 prose-p:text-slate-300 prose-strong:text-emerald-400 prose-li:text-slate-300">
                  <Markdown>{job.tailored_resume}</Markdown>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[#334155] p-8 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                  <p className="text-sm text-slate-500">No tailored resume yet</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Add a tailored resume for this position
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                  Recruiter
                </h3>
                <ContactCard
                  name={job.recruiter_name}
                  linkedin={job.recruiter_linkedin}
                  role="Recruiter"
                />
              </div>
              <div>
                <h3 className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                  Hiring Manager
                </h3>
                <ContactCard
                  name={job.hiring_manager_name}
                  linkedin={job.hiring_manager_linkedin}
                  role="Hiring Manager"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ContactCard({
  name,
  linkedin,
  role,
}: {
  name: string;
  linkedin: string;
  role: string;
}) {
  const found = name !== "Not Found";
  return (
    <div className="rounded-lg border border-[#334155] bg-[#1E293B] p-3">
      {found ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-200">{name}</p>
            <p className="font-mono text-xs text-slate-500">{role}</p>
          </div>
          {linkedin !== "Not Found" && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 font-mono text-xs text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-600 italic">Not found</p>
      )}
    </div>
  );
}
