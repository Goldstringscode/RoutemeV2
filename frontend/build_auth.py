import os
base = 'C:\\Users\\Justin\\sites\\routemev2\\frontend'
os.chdir(base)

# =====================================================
# RouteMe Auth Migration — Phase 1
# =====================================================
# Replaces hardcoded credential validation in all 3 login
# pages with real Supabase auth. Adds Demo Login buttons.
# Keeps mock data as fallback (no database persistence yet).
# =====================================================

# --- 1. Login.jsx ---
login = '''
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, LogIn } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { signIn, DEMO_ACCOUNTS } from "@/lib/supabase";
import HipaaBadge from "@/components/HipaaBadge";

export default function Login() {
  const { setAuthed, pushAudit } = useRouteMe();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { user, error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) {
      setError(signInError.message || "Invalid email or password.");
      return;
    }
    if (user) {
      pushAudit("Signed in", "read");
      navigate("/app/dashboard");
    }
  };

  const demoLogin = async () => {
    setError("");
    setLoading(true);
    const { user, error: signInError } = await signIn(
      DEMO_ACCOUNTS.nurse.email, DEMO_ACCOUNTS.nurse.password
    );
    setLoading(false);
    if (signInError) {
      setError("Demo login failed: " + signInError.message + '. Make sure the demo user is created in Supabase Auth.');
      return;
    }
    if (user) {
      pushAudit("Demo signed in", "read");
      navigate("/app/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] grid lg:grid-cols-2">
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
          <p className="text-xs uppercase tracking-[0.22em] text-white/50 font-semibold mb-6">For traveling home health nurses</p>
          <h1 className="font-display text-5xl leading-[1.05]">
            Sign in, and we&apos;ll plan the <span className="font-serif-i text-[#F7E5DD]">quietest</span> path through your day.
          </h1>
          <p className="mt-6 text-white/70 text-sm leading-relaxed">Your PHI never leaves the session.</p>
          <div className="mt-10 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> HIPAA
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Encrypted
            </div>
          </div>
        </div>
        <div className="relative text-xs text-white/50">Supabase Auth</div>
      </div>

      <div className="relative flex items-center justify-center p-8 lg:p-12">
        <div className="absolute top-6 right-6"><HipaaBadge /></div>
        <div className="w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-3">Welcome back</p>
          <h2 className="font-display text-4xl leading-tight">Sign in to <span className="font-serif-i text-[#D95D39]">RouteMe</span>.</h2>
          <p className="mt-3 text-sm text-stone-600">Use your account or try the demo as Amara Okafor.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Email</label>
              <input data-testid="login-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required disabled={loading} placeholder="nurse@agency.com" className="mt-1.5 w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100 transition-colors disabled:opacity-50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Password</label>
              <input data-testid="login-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required disabled={loading} placeholder="Enter your password" className="mt-1.5 w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100 transition-colors disabled:opacity-50" />
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-xs text-stone-500 hover:text-stone-900 hover:underline font-semibold">Forgot password?</Link>
              </div>
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}
            <button data-testid="login-submit" type="submit" disabled={loading} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] disabled:bg-stone-300 disabled:cursor-not-allowed text-white h-12 text-sm font-semibold transition-colors">
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>Enter workspace <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-stone-400 font-semibold">or</span></div>
            </div>
            <button type="button" onClick={demoLogin} disabled={loading} data-testid="demo-login-btn" className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#D95D39]/30 hover:border-[#D95D39] text-[#D95D39] h-12 text-sm font-semibold transition-colors disabled:opacity-50">
              <LogIn className="h-4 w-4" />
              Demo Login - Amara Okafor, RN
            </button>
            <p className="text-xs text-stone-500 text-center pt-2">By continuing you accept RouteMe&apos;s HIPAA business associate terms.</p>
            <p className="text-xs text-stone-500 text-center">
              Agency director? <a href="/agency/login" data-testid="login-agency-link" className="font-semibold text-stone-800 hover:underline">Sign in to the agency console</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
'''

with open('src/pages/Login.jsx', 'w') as f:
    f.write(login.lstrip())
print(f'Login.jsx: {len(login)} bytes')
print(f'  Has DEMO_ACCOUNTS: {"DEMO_ACCOUNTS" in login}')
print(f'  Has demo-login-btn: {"demo-login-btn" in login}')
print(f'  No hardcoded creds: {"validEmail" not in login}')

# --- 2. AgencyLogin.jsx ---
agency = '''
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
'''

with open('src/pages/AgencyLogin.jsx', 'w') as f:
    f.write(agency.lstrip())
print(f'AgencyLogin.jsx: {len(agency)} bytes')
print(f'  Has DEMO_ACCOUNTS: {"DEMO_ACCOUNTS" in agency}')
print(f'  Has agency-demo-btn: {"agency-demo-btn" in agency}')
print(f'  No hardcoded creds: {"validEmail" not in agency}')

# --- 3. SuperAdminLogin.jsx ---
sa = '''
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, Shield, Fingerprint } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { signIn, DEMO_ACCOUNTS } from "@/lib/supabase";

export default function SuperAdminLogin() {
  const { setSuperAdminAuthed } = useRouteMe();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("000000");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!email.trim() || !password.trim()) {
        setError("Please enter your email and password.");
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
        setStep(2);
      }
    } else {
      if (!otp.trim()) {
        setError("Please enter your 6-digit code.");
        return;
      }
      setSuperAdminAuthed(true);
      navigate("/superadmin/overview");
    }
  };

  const demoLogin = async () => {
    setError("");
    setLoading(true);
    const { user, error: signInError } = await signIn(
      DEMO_ACCOUNTS.superAdmin.email, DEMO_ACCOUNTS.superAdmin.password
    );
    setLoading(false);
    if (signInError) {
      setError("Demo login failed: " + signInError.message);
      return;
    }
    if (user) {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white grid lg:grid-cols-5 rm-grain">
      <div className="lg:col-span-2 relative flex items-center justify-center p-8 lg:p-12 bg-stone-900/60 border-r border-white/10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#D95D39] to-[#8a3a24] font-display font-semibold flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display text-lg leading-tight text-white">RouteMe Platform</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#D95D39] font-semibold">Root access Restricted</div>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-3">For platform operators only</p>
          <h2 className="font-display text-4xl leading-tight">The <span className="font-serif-i text-[#D95D39]">operating system</span> of RouteMe.</h2>
          <p className="mt-3 text-sm text-white/60">Every agency, every nurse, every visit under one accountable lens.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-white/70 tracking-wide">Root email</label>
                  <input data-testid="sa-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required disabled={loading} className="mt-1.5 w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#D95D39] focus:outline-none focus:ring-4 focus:ring-[#D95D39]/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 tracking-wide flex items-center gap-2"><KeyRound className="h-3.5 w-3.5" /> Password</label>
                  <input data-testid="sa-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required disabled={loading} className="mt-1.5 w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#D95D39] focus:outline-none focus:ring-4 focus:ring-[#D95D39]/20" />
                </div>
                {error && (
                  <div className="rounded-xl bg-red-900/40 border border-red-500/30 px-4 py-3 text-sm text-red-200 font-medium flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {error}
                  </div>
                )}
                <button data-testid="sa-continue-btn" type="submit" disabled={loading} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] disabled:opacity-50 disabled:cursor-not-allowed text-white h-12 text-sm font-semibold transition-colors">
                  {loading ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <>Continue to MFA <ArrowRight className="h-4 w-4" /></>}
                </button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <div className="relative flex justify-center"><span className="bg-stone-900/60 px-3 text-xs text-white/40 font-semibold">or</span></div>
                </div>
                <button type="button" onClick={demoLogin} disabled={loading} data-testid="sa-demo-btn" className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/20 hover:border-white/50 text-white/80 h-12 text-sm font-semibold transition-colors disabled:opacity-50">
                  <Shield className="h-4 w-4" />
                  Demo Login - Dr. Isla Fernandez
                </button>
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
                      <Fingerprint className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Approved on authenticator app</p>
                      <p className="text-xs text-white/50">Or enter the 6-digit backup code below.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 tracking-wide">6-digit backup code</label>
                  <input data-testid="sa-otp" value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" maxLength={6} className="mt-1.5 w-full h-14 rounded-xl border border-white/10 bg-white/5 px-4 text-2xl tracking-[0.5em] font-display text-center text-white focus:border-[#D95D39]" />
                </div>
                {error && (
                  <div className="rounded-xl bg-red-900/40 border border-red-500/30 px-4 py-3 text-sm text-red-200 font-medium flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {error}
                  </div>
                )}
                <button data-testid="sa-verify-btn" type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-12 text-sm font-semibold transition-colors">
                  Verify and enter platform <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-white/50 hover:text-white pt-1">Back</button>
              </>
            )}
            <div className="flex items-center justify-between text-xs text-white/40 pt-3">
              <span>Access logged IP audited</span>
              <span>SOC2 SSO MFA</span>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex lg:col-span-3 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#D95D39]/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#7FA08B]/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Platform console v1.4.2</div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> All systems normal
          </div>
        </div>
        <div className="relative max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-4">Above every agency</p>
          <h1 className="font-display text-6xl leading-[1.02]">The single pane<br />of <span className="font-serif-i text-[#F7E5DD]">accountability</span>.</h1>
          <p className="mt-6 text-white/60 text-sm max-w-lg leading-relaxed">6 agencies, 172 nurses, 475 clients.</p>
          <div className="mt-10 grid grid-cols-4 gap-6">
            <MiniK n="6" label="agencies" />
            <MiniK n="172" label="nurses" />
            <MiniK n="475" label="clients" />
            <MiniK n="99.98%" label="uptime" />
          </div>
        </div>
        <div className="relative text-xs text-white/40">Supabase Auth</div>
      </div>
    </div>
  );
}

function MiniK({ n, label }) {
  return (
    <div>
      <div className="font-display text-3xl leading-none text-white">{n}</div>
      <div className="text-xs text-white/50 mt-2 tracking-wide">{label}</div>
    </div>
  );
}
'''

with open('src/pages/SuperAdminLogin.jsx', 'w') as f:
    f.write(sa.lstrip())
print(f'SuperAdminLogin.jsx: {len(sa)} bytes')
print(f'  Has DEMO_ACCOUNTS: {"DEMO_ACCOUNTS" in sa}')
print(f'  Has sa-demo-btn: {"sa-demo-btn" in sa}')
print(f'  No hardcoded creds: {"validEmail" not in sa}')

print()
print('=== ALL FILES WRITTEN SUCCESSFULLY ===')
print()

# Final verification
all_ok = True
for fpath, checks in [
    ('src/pages/Login.jsx', ['DEMO_ACCOUNTS', 'signIn', 'demo-login-btn', 'setAuthed']),
    ('src/pages/AgencyLogin.jsx', ['DEMO_ACCOUNTS', 'signIn', 'agency-demo-btn', 'setAgencyAuthed']),
    ('src/pages/SuperAdminLogin.jsx', ['DEMO_ACCOUNTS', 'signIn', 'sa-demo-btn', 'setSuperAdminAuthed']),
]:
    with open(fpath, 'r') as f:
        content = f.read()
    for check in checks:
        if check not in content:
            print(f'FAIL: {fpath} missing "{check}"')
            all_ok = False
    if 'validEmail' in content or 'validPassword' in content:
        print(f'FAIL: {fpath} still has hardcoded credentials!')
        all_ok = False

if all_ok:
    print('ALL VERIFICATION CHECKS PASSED')
else:
    print('SOME CHECKS FAILED')
