import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Building2, Users, ShieldCheck, Sparkles, Palette } from "lucide-react";

const STEPS = [
  { key: "welcome", title: "Welcome to your Agency Console", icon: Sparkles, body: "In 3 minutes, your agency will be set up and ready to invite nurses. Let&apos;s go." },
  { key: "identity", title: "Tell us about your agency", icon: Building2, body: "This appears on invoices, nurse invites, and PHI audit logs.", form: true },
  { key: "invite", title: "Invite your first nurse", icon: Users, body: "Skip if you want to onboard later. Otherwise send one now — takes 20 seconds.", form: true },
  { key: "hipaa", title: "HIPAA & BAA", icon: ShieldCheck, body: "Sign your Business Associate Agreement. This is a one-time legal step required to process PHI." },
  { key: "brand", title: "Add your brand", icon: Palette, body: "Upload a logo and pick a primary color. You can change these anytime.", optional: true },
];

export default function AgencyOnboarding() {
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState("Sunrise Home Health");
  const [nurseEmail, setNurseEmail] = useState("");
  const [baaAgreed, setBaaAgreed] = useState(false);
  const navigate = useNavigate();

  const cur = STEPS[step];
  const Icon = cur.icon;
  const isLast = step === STEPS.length - 1;

  const canNext = cur.key === "hipaa" ? baaAgreed : true;
  const next = () => {
    if (isLast) navigate("/agency/overview");
    else setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)]">
        <div className="flex">
          {STEPS.map((s, i) => (
            <div key={s.key} className={`h-1 flex-1 ${i <= step ? "bg-[#D95D39]" : "bg-stone-200"}`} />
          ))}
        </div>

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center"><Icon className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Step {step + 1} of {STEPS.length}</p>
              <h1 className="font-display text-2xl mt-0.5">{cur.title}</h1>
            </div>
          </div>

          <p className="text-stone-600 leading-relaxed">{cur.body}</p>

          {/* Step-specific content */}
          {cur.key === "identity" && (
            <div className="mt-6 space-y-4" data-testid="ao-identity-form">
              <div><label className="text-xs font-semibold text-stone-700">Agency name</label>
                <input data-testid="ao-org-name" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100" />
              </div>
            </div>
          )}
          {cur.key === "invite" && (
            <div className="mt-6" data-testid="ao-invite-form">
              <label className="text-xs font-semibold text-stone-700">Nurse email (optional)</label>
              <input data-testid="ao-nurse-email" type="email" value={nurseEmail} onChange={(e) => setNurseEmail(e.target.value)} placeholder="nurse@yourpractice.com" className="mt-1.5 w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100" />
              <p className="mt-2 text-xs text-stone-500">They&apos;ll receive an invite link and setup their password themselves.</p>
            </div>
          )}
          {cur.key === "hipaa" && (
            <label className="mt-6 flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 cursor-pointer" data-testid="ao-baa-block">
              <input data-testid="ao-baa" type="checkbox" checked={baaAgreed} onChange={(e) => setBaaAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#D95D39]" />
              <div className="text-sm text-stone-700">
                I agree to the <a href="/legal/baa" target="_blank" className="underline underline-offset-2 decoration-stone-300 hover:text-stone-900">HIPAA Business Associate Agreement</a>. RouteMe Inc. is designated as our Business Associate under 45 CFR § 160.103.
              </div>
            </label>
          )}
          {cur.key === "brand" && (
            <div className="mt-6 grid grid-cols-2 gap-4" data-testid="ao-brand-form">
              <div>
                <label className="text-xs font-semibold text-stone-700">Logo</label>
                <button className="mt-1.5 w-full h-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-stone-500 bg-white text-stone-500 text-sm font-semibold">Click to upload</button>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700">Primary color</label>
                <input type="color" defaultValue="#D95D39" className="mt-1.5 h-24 w-full rounded-xl border border-stone-200 cursor-pointer" />
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center gap-3">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="text-sm text-stone-500 hover:text-stone-900">← Back</button>}
            {cur.optional && <button onClick={next} className="text-sm text-stone-500 hover:text-stone-900">Skip</button>}
            <button onClick={next} disabled={!canNext} data-testid="ao-next" className={`ml-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${canNext ? "bg-[#D95D39] hover:bg-[#C05030] text-white" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}>
              {isLast ? <>Enter agency console <ArrowRight className="h-4 w-4" /></> : <>Continue <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
