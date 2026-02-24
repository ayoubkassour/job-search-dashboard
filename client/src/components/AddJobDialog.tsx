import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Job } from "@/lib/supabase";

interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (job: Partial<Job>) => void;
}

export function AddJobDialog({ open, onOpenChange, onAdd }: AddJobDialogProps) {
  const [form, setForm] = useState({
    company: "",
    job_title: "",
    job_url: "",
    key_requirements: "",
    recruiter_name: "",
    recruiter_linkedin: "",
    hiring_manager_name: "",
    hiring_manager_linkedin: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...form,
      recruiter_name: form.recruiter_name || "Not Found",
      recruiter_linkedin: form.recruiter_linkedin || "Not Found",
      hiring_manager_name: form.hiring_manager_name || "Not Found",
      hiring_manager_linkedin: form.hiring_manager_linkedin || "Not Found",
      status: "Saved",
      source: "manual",
    });
    setForm({
      company: "",
      job_title: "",
      job_url: "",
      key_requirements: "",
      recruiter_name: "",
      recruiter_linkedin: "",
      hiring_manager_name: "",
      hiring_manager_linkedin: "",
    });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-[#334155] bg-[#0F172A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#334155] px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
            <Plus className="h-5 w-5 text-emerald-400" />
            Add Job
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 p-6">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Company *"
              value={form.company}
              onChange={(v) => setForm({ ...form, company: v })}
              required
            />
            <Field
              label="Job Title *"
              value={form.job_title}
              onChange={(v) => setForm({ ...form, job_title: v })}
              required
            />
          </div>
          <Field
            label="Job URL *"
            value={form.job_url}
            onChange={(v) => setForm({ ...form, job_url: v })}
            required
            type="url"
          />
          <Field
            label="Key Requirements"
            value={form.key_requirements}
            onChange={(v) => setForm({ ...form, key_requirements: v })}
            placeholder="Comma-separated"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Recruiter Name"
              value={form.recruiter_name}
              onChange={(v) => setForm({ ...form, recruiter_name: v })}
            />
            <Field
              label="Recruiter LinkedIn"
              value={form.recruiter_linkedin}
              onChange={(v) => setForm({ ...form, recruiter_linkedin: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Hiring Manager"
              value={form.hiring_manager_name}
              onChange={(v) => setForm({ ...form, hiring_manager_name: v })}
            />
            <Field
              label="HM LinkedIn"
              value={form.hiring_manager_linkedin}
              onChange={(v) => setForm({ ...form, hiring_manager_linkedin: v })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-[#334155] px-4 py-2 font-mono text-xs text-slate-400 hover:bg-[#1E293B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 font-mono text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
      />
    </div>
  );
}
