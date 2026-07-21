import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, Shield, Fingerprint } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function SuperAdminLogin() {
  const { setSuperAdminAuthed, superAdminMe } = useRouteMe();
  const navigate = useNavigate();
  const [email, setEmail] = useState(superAdminMe.email);
  const [password, setPassword] = useState("super1234");
  const [otp, setOtp] = useState("000000");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const next = (e) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      // Validate step 1: email + password
      const validEmail = "super@routeme.com";
      const validPassword = "super1234";
      if (email !== validEmail || password !== validPassword) {
        setError("Invalid root email or password.");
        return;
      }
      setStep(2);
    } else {
      // Validate step 2: OTP
      const validOtp = "000000";
      if (otp !== validOtp) {
        setError("Invalid backup code. Try 000000.");
        return;
      }
      setSuperAdminAuthed(true);
      navigate("/superadmin/overview");
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
              <div className="font-display text-lg leading-tight text-white">RouteMe · Platform</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#D95D39] font-semibold">
                Root access · Restricted
              </div>
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-3">
            For platform operators only
          </p>
          <h2 className="font-display text-4xl leading-tight">
            The <span className="font-serif-i text-[#D95D39]">operating system</span> of RouteMe.
          </h2>
          <p className="mt-3 text-sm text-white/60">
            Every agency, every nurse, every visit — under one accountable lens. Access is logged, MFA is enforced.
          </p>

          <form onSubmit={next} className="mt-8 space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-white/70 tracking-wide">Root email</label>
                  <input
                    data-testid="sa-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    className="mt-1.5 w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#D95D39] focus:outline-none focus:ring-4 focus:ring-[#D95D39]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 tracking-wide flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5" /> Password
                  </label>
                  <input
                    data-testid="sa-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    className="mt-1.5 w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-[#D95D39] focus:outline-none focus:ring-4 focus:ring-[#D95D39]/20"
                  />
                </div>
                {error && (
                                  <div className="rounded-xl bg-red-900/40 border border-red-500/30 px-4 py-3 text-sm text-red-200 font-medium flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                                    {error}
                                  </div>
                                )}
                                <button
                                  data-testid="sa-continue-btn"
                                  type="submit"
                                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-12 text-sm font-semibold transition-colors"
                                >
                                  Continue to MFA
                  <ArrowRight className="h-4 w-4" />
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
                      <p className="text-sm font-semibold">Approve on authenticator app</p>
                      <p className="text-xs text-white/50">Or enter the 6-digit backup code below.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 tracking-wide">6-digit backup code</label>
                  <input
                    data-testid="sa-otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-1.5 w-full h-14 rounded-xl border border-white/10 bg-white/5 px-4 text-2xl tracking-[0.5em] font-display text-center text-white focus:border-[#D95D39] focus:outline-none focus:ring-4 focus:ring-[#D95D39]/20"
                  />
                </div>
                {error && (
                                  <div className="rounded-xl bg-red-900/40 border border-red-500/30 px-4 py-3 text-sm text-red-200 font-medium flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                                    {error}
                                  </div>
                                )}
                                <button
                                  data-testid="sa-verify-btn"
                                  type="submit"
                                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-12 text-sm font-semibold transition-colors"
                                >
                                  Verify & enter platform
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-white/50 hover:text-white pt-1"
                >
                  ← Back
                </button>
              </>
            )}

            <div className="flex items-center justify-between text-xs text-white/40 pt-3">
              <span>Access logged · IP 10.0.14.22</span>
              <span>SOC2 · SSO · MFA</span>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:col-span-3 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#D95D39]/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#7FA08B]/20 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">
            Platform console · v1.4.2
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> All systems normal
          </div>
        </div>

        <div className="relative max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-4">
            Above every agency
          </p>
          <h1 className="font-display text-6xl leading-[1.02]">
            The single pane<br />
            of <span className="font-serif-i text-[#F7E5DD]">accountability</span>.
          </h1>
          <p className="mt-6 text-white/60 text-sm max-w-lg leading-relaxed">
            6 agencies · 172 nurses · 475 clients · 47 audit events last hour.
            Everything moves through here — nothing moves without a trace.
          </p>

          <div className="mt-10 grid grid-cols-4 gap-6">
            <MiniK n="6" label="agencies" />
            <MiniK n="172" label="nurses" />
            <MiniK n="475" label="clients" />
            <MiniK n="99.98%" label="uptime" />
          </div>
        </div>

        <div className="relative text-xs text-white/40">Prototype · mocked platform data</div>
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
