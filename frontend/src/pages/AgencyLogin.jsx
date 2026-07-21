import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2 } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import HipaaBadge from "@/components/HipaaBadge";

export default function AgencyLogin() {
  const { setAgencyAuthed, agency } = useRouteMe();
  const navigate = useNavigate();
  const [email, setEmail] = useState(agency.admin.email);
  const [password, setPassword] = useState("demo1234");
  const [code, setCode] = useState("SUNRISE-2026");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");

    // Demo credential validation
    const validEmail = "marcia.brown@sunrisehomehealth.com";
    const validPassword = "demo1234";
    const validCode = "SUNRISE-2026";

    if (email !== validEmail || password !== validPassword || code !== validCode) {
      setError("Invalid credentials. Check the agency code, email, and password.");
      return;
    }

    setAgencyAuthed(true);
    navigate("/agency/overview");
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] grid lg:grid-cols-5">
      {/* Left form */}
      <div className="lg:col-span-2 relative flex items-center justify-center p-8 lg:p-12">
        <div className="absolute top-6 right-6"><HipaaBadge /></div>
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-2xl bg-stone-900 text-white font-display font-semibold flex items-center justify-center">
              {agency.logo}
            </div>
            <div>
              <div className="font-display text-lg leading-tight">RouteMe</div>
              <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                Agency console
              </div>
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-3">
            For agency directors
          </p>
          <h2 className="font-display text-4xl leading-tight">
            The <span className="font-serif-i text-[#D95D39]">command center</span> for your field team.
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            Sign in to manage nurses, monitor visits in real time, and stay HIPAA-compliant across your entire agency.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Agency code</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 h-12">
                <Building2 className="h-4 w-4 text-stone-400" />
                <input
                  data-testid="agency-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none tracking-widest font-semibold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Director email</label>
              <input
                data-testid="agency-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-1.5 w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Password</label>
              <input
                data-testid="agency-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="mt-1.5 w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100"
              />
            </div>

            {error && (
                          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                            {error}
                          </div>
                        )}

                        <button
                          data-testid="agency-login-submit"
                          type="submit"
                          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white h-12 text-sm font-semibold transition-colors"
            >
              Enter command center
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-3">
              <a href="/login" className="hover:text-stone-800">Nurse sign-in →</a>
              <span>SSO · MFA · SOC2</span>
            </div>
          </form>
        </div>
      </div>

      {/* Right dark editorial panel */}
      <div className="hidden lg:flex lg:col-span-3 relative flex-col justify-between p-12 bg-stone-900 text-white overflow-hidden rm-grain">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#D95D39]/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#7FA08B]/25 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.22em] text-white/50 font-semibold">
            Agency console · v1
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live · 12 nurses on shift
          </div>
        </div>

        <div className="relative max-w-2xl">
          <h1 className="font-display text-6xl leading-[1.02]">
            One dashboard.<br />
            <span className="font-serif-i text-[#F7E5DD]">Every nurse.</span> Every mile.
          </h1>
          <p className="mt-6 text-white/70 text-sm max-w-lg leading-relaxed">
            Onboard nurses in seconds, watch live activity across zones, and stay ahead of every
            HIPAA audit — with the calm of a tool built for care, not clicks.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            <MiniK n="12" label="active nurses" />
            <MiniK n="47" label="visits today" />
            <MiniK n="98" label="HIPAA score" />
          </div>
        </div>

        <div className="relative text-xs text-white/50">Prototype · mocked authentication</div>
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
