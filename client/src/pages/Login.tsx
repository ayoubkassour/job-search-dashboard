import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Radar, LogIn, UserPlus, Loader2 } from "lucide-react";

export function Login() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setSignupSuccess(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Radar className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Job Search Command Center</h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Singapore PM Roles
          </p>
        </div>

        {signupSuccess ? (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
            <p className="text-sm text-emerald-400">Account created! Check your email to confirm, then log in.</p>
            <button
              onClick={() => { setMode("login"); setSignupSuccess(false); }}
              className="mt-3 font-mono text-xs text-emerald-400 underline"
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[#334155] bg-[#1E293B] p-6">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                placeholder="Min 6 characters"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 font-mono text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
                className="font-mono text-xs text-slate-500 hover:text-slate-300"
              >
                {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
