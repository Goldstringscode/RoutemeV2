import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { supabase } from "@/lib/supabase";
import HipaaBadge from "@/components/HipaaBadge";

export default function Login() {
  const { setAuthed, pushAudit } = useRouteMe();
  const navigate = useNavigate();
  const [email, setEmail] = useState("amara.okafor@nurse.demo");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data?.session) {
      setAuthed(true);
      pushAudit("Signed in — Supabase auth", "read");
      navigate("/app/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] grid lg:grid-cols-2">
      {/* Left illustrative panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-stone-900 text-white overflow-hidden rm-grain">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#D95D39]/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#7FA08B]/30 blur-3xl" />

        <div className="relative flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-xl bg-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-stone-900" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#D95D39] border-2 border-stone-900" />
          </div>
          <span className="font-display text-xl font-semibold">RouteMe</span>
        </div>

        <div className="relative max-w-md">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50 font-semibold mb-6">
            For traveling home health nurses
          </p>
          <h1 className="font-display text-5xl leading-[1.05]">
            Sign in, and we&apos;ll plan the <span className="font-serif-i text-[#F7E5DD]">quietest</span> path through your day.
          </h1>
          <p className="mt-6 text-white/70 text-sm leading-relaxed">
            Your PHI never leaves the session. Every action is logged in an immutable audit trail —
            because privacy shouldn&apos;t slow you down.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
              <ShieldCheck className="h-3 w-3" />
              HIPAA · SOC2 aligned
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
              End-to-end encrypted
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          Prototype · powered by Supabase
        </p>
      </div>

      {/* Right — Login form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <HipaaBadge compact />

          <p className="mt-8 text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
            Welcome back
          </p>
          <h2 className="font-display text-4xl mt-2 leading-tight">
            Sign in to <span className="font-serif-i text-[#D95D39]">RouteMe</span>.
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Use the pre-filled demo credentials to explore the prototype.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide block mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all"
                placeholder="nurse@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-btn"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white h-12 text-sm font-semibold transition-colors"
            >
              {loading ? "Signing in..." : "Enter today's workspace"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-stone-500">
            Demo: <span className="font-mono text-stone-700">amara.okafor@nurse.demo</span> / <span className="font-mono text-stone-700">demo1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
