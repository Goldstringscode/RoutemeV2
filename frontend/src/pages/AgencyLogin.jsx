import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2 } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { signIn, DEMO_ACCOUNTS } from "@/lib/supabase";
import HipaaBadge from "@/components/HipaaBadge";

export default function AgencyLogin() {
  const { setAgencyAuthed, agency } = useRouteMe();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim() || !code.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const { user, error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) {
      setError(signInError.message || "Invalid credentials.");
      return;
    }
    if (user) {
      setAgencyAuthed(true);
      navigate("/agency/overview");
    }
  };

  const demoLogin = async () => {
    setError("");
    setLoading(true);
    const { user, error: signInError } = await signIn(
      DEMO_ACCOUNTS.agency.email, DEMO_ACCOUNTS.agency.password
    );
    setLoading(false);
    if (signInError) {
      setError("Demo login failed: " + signInError.message);
      return;
    }
    if (user) {
      setCode(DEMO_ACCOUNTS.agency.code);
      setAgencyAuthed(true);
      navigate("/agency/overview");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] grid lg:grid-cols-5">
      <div className="lg:col-span-2 relative flex items-center justify-center p-8 lg:p-12">
        <div className="absolute top-6 right-6"><HipaaBadge /></div>
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-2xl bg-stone-900 text-white font-display font-semibold flex items-center justify-center">{agency.logo}</div>
            <div>
              <div className="font-display text-lg leading-tight">RouteMe</div>
              <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Agency console</div>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-3">For agency directors</p>
          <h2 className="font-display text-4xl leading-tight">The <span className="font-serif-i text-[#D95D39]">command center</span> for your field team.</h2>
          <p className="mt-3 text-sm text-stone-600">Sign in to manage nurses, monitor visits, and stay HIPAA-compliant.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Agency code</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 h-12">
                <Building2 className="h-4 w-4 text-stone-400" />
                <input data-testid="agency-code" value={code} onChange={(e) => setCode(e.target.value)} disabled={loading} className="flex-1 bg-transparent text-sm outline-none tracking-widest font-semibold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Director email</label>
              <input data-testid="agency-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required disabled={loading} className="mt-1.5 w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-stone-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Password</label>
              <input data-testid="agency-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required disabled={loading} className="mt-1.5 w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-stone-400" />
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}
            <button data-testid="agency-login-submit" type="submit" disabled={loading} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed text-white h-12 text-sm font-semibold transition-colors">
              {loading ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <>Enter command center <ArrowRight className="h-4 w-4" /></>}
            </button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-stone-400 font-semibold">or</span></div>
            </div>
            <button type="button" onClick={demoLogin} disabled={loading} data-testid="agency-demo-btn" className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-stone-300 hover:border-stone-900 text-stone-700 h-12 text-sm font-semibold transition-colors disabled:opacity-50">
              <Building2 className="h-4 w-4" />
              Demo Login - Priya Nair (Sunrise HH)
            </button>
            <div className="flex items-center justify-between text-xs text-stone-500 pt-3">
              <a href="/login" className="hover:text-stone-800">Nurse sign-in</a>
              <span>SSO / MFA / SOC2</span>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex lg:col-span-3 relative flex-col justify-between p-12 bg-stone-900 text-white overflow-hidden rm-grain">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#D95D39]/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#7FA08B]/25 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.22em] text-white/50 font-semibold">Agency console v1</div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live - 12 nurses on shift
          </div>
        </div>
        <div className="relative max-w-2xl">
          <h1 className="font-display text-6xl leading-[1.02]">One dashboard.<br /><span className="font-serif-i text-[#F7E5DD]">Every nurse.</span> Every mile.</h1>
          <p className="mt-6 text-white/70 text-sm max-w-lg leading-relaxed">Onboard nurses in seconds, watch live activity, stay ahead of every HIPAA audit.</p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <MiniK n="12" label="active nurses" />
            <MiniK n="47" label="visits today" />
            <MiniK n="98" label="HIPAA score" />
          </div>
        </div>
        <div className="relative text-xs text-white/50">Supabase Auth</div>
      </div>
    </div>
  );
}

function MiniK({ n, label }) {
  return (
    <div>
      <div className="font-display text-4xl leading-none">{n}</div>
      <div className="text-xs text-white/60 mt-2 tracking-wide">{label}</div>
    </div>
  );
}
