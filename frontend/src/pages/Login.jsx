import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import HipaaBadge from "@/components/HipaaBadge";

export default function Login() {
  const { setAuthed, pushAudit } = useRouteMe();
  const navigate = useNavigate();
  const [email, setEmail] = useState("amara.okafor@nurse.demo");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");

    // Demo credential validation
    const validEmail = "amara.okafor@nurse.demo";
    const validPassword = "demo1234";

    if (email !== validEmail || password !== validPassword) {
      setError("Invalid email or password. Try the demo credentials.");
      return;
    }

    setAuthed(true);
    pushAudit("Signed in — mocked auth", "read");
    navigate("/app/dashboard");
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
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> HIPAA · SOC2 aligned
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> End-to-end encrypted
            </div>
          </div>
        </div>

        <div className="relative text-xs text-white/50">Prototype · mocked authentication</div>
      </div>

      {/* Right form panel */}
      <div className="relative flex items-center justify-center p-8 lg:p-12">
        <div className="absolute top-6 right-6"><HipaaBadge /></div>

        <div className="w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-3">
            Welcome back
          </p>
          <h2 className="font-display text-4xl leading-tight">
            Sign in to <span className="font-serif-i text-[#D95D39]">RouteMe</span>.
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            Use the pre-filled demo credentials to explore the prototype.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Email</label>
              <input
                data-testid="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-1.5 w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Password</label>
              <input
                data-testid="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="mt-1.5 w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100 transition-colors"
              />
            </div>

                        {error && (
                          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                            {error}
                          </div>
                        )}

                        <button
                          data-testid="login-submit"
                          type="submit"
                          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-12 text-sm font-semibold transition-colors"
            >
              Enter today&apos;s workspace
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-xs text-stone-500 text-center pt-2">
              By continuing you accept RouteMe&apos;s HIPAA business associate terms.
            </p>
            <p className="text-xs text-stone-500 text-center">
              Agency director?{" "}
              <a href="/agency/login" data-testid="login-agency-link" className="font-semibold text-stone-800 hover:underline">
                Sign in to the agency console →
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
