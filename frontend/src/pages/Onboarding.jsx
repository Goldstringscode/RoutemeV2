import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Sparkles, Route, Mic, ShieldCheck, X } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

const STEPS = [
  { key: "welcome", title: "Welcome to RouteMe", body: "This 60-second tour shows you the three things nurses use every day.", art: Sparkles },
  { key: "route", title: "Your daily route", body: "Every morning, your clients are auto-optimized into the fastest driving order. You can drag to reorder or hit 'Re-optimize'.", art: Route },
  { key: "voice", title: "Voice-to-text notes", body: "Tap the mic. Speak your visit notes. RouteMe transcribes, timestamps, and locks them into an audit trail.", art: Mic },
  { key: "phi", title: "PHI is protected", body: "Every access to a client record is logged. Toggle PHI masking anytime — your data never leaves HIPAA hands.", art: ShieldCheck },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { nurse } = useRouteMe();
  const [step, setStep] = useState(0);
  const cur = STEPS[step];
  const Art = cur.art;

  const next = () => (step === STEPS.length - 1 ? navigate("/app/dashboard") : setStep((s) => s + 1));
  const skip = () => navigate("/app/dashboard");

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)]">
        {/* progress bar */}
        <div className="flex">
          {STEPS.map((s, i) => (
            <div key={s.key} className={`h-1 flex-1 ${i <= step ? "bg-[#D95D39]" : "bg-stone-200"}`} />
          ))}
        </div>

        <div className="p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
          {/* Left: art */}
          <div className="relative rounded-3xl bg-stone-900 aspect-square flex items-center justify-center overflow-hidden">
            <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#D95D39]/40 blur-3xl" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="h-24 w-24 rounded-3xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur">
                <Art className="h-12 w-12 text-[#F7E5DD]" strokeWidth={1.5} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 font-semibold">
                Step {step + 1} of {STEPS.length}
              </p>
            </div>
          </div>

          {/* Right: copy */}
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
              Welcome, {nurse.name.split(" ")[0]}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight">
              {cur.title.includes("RouteMe") ? (
                <>Welcome to <span className="font-serif-i text-[#D95D39]">RouteMe</span></>
              ) : cur.title}
            </h1>
            <p className="mt-4 text-stone-600 leading-relaxed">{cur.body}</p>

            <div className="mt-8 flex items-center gap-3">
              <button onClick={skip} data-testid="tour-skip" className="text-sm text-stone-500 hover:text-stone-900">
                Skip tour
              </button>
              <button
                onClick={next} data-testid="tour-next"
                className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold"
              >
                {step === STEPS.length - 1 ? <>Go to dashboard <ArrowRight className="h-4 w-4" /></> : <>Next <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        </div>

        <button onClick={skip} className="absolute top-6 right-6 h-8 w-8 rounded-full hover:bg-stone-100 text-stone-400 flex items-center justify-center" data-testid="tour-close">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
