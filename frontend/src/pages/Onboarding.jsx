import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Route, Mic, ShieldCheck, ArrowRight, X } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

const STEPS = [
  { key: "welcome", title: "Welcome to RouteMe", body: "This 60-second tour shows you the three things nurses use every day.", art: Sparkles },
  { key: "route", title: "Your daily route", body: "Every morning, your clients are auto-optimized into the fastest driving order. You can drag to reorder or hit 'Re-optimize'.", art: Route },
  { key: "voice", title: "Voice-to-text notes", body: "Tap the mic. Speak your visit notes. RouteMe transcribes, timestamps, and locks them into an audit trail.", art: Mic },
  { key: "phi", title: "PHI is protected", body: "Every access to a client record is logged. Toggle PHI masking anytime — your data never leaves HIPAA hands.", art: ShieldCheck },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { nurse, onboardingComplete, markOnboardingComplete } = useRouteMe();
  const [step, setStep] = useState(0);
  const cur = STEPS[step];
  const Art = cur.art;

  // If already completed, redirect straight to dashboard
  useEffect(() => {
    if (onboardingComplete) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [onboardingComplete, navigate]);

  const finish = () => {
    markOnboardingComplete();
    navigate("/app/dashboard");
  };

  const next = () => (step === STEPS.length - 1 ? finish() : setStep((s) => s + 1));

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)]">
        {/* progress bar */}
        <div className="flex">
          {STEPS.map((s, i) => (
            <div key={s.key} className={`h-1 flex-1 ${i <= step ? "bg-[#D95D39]" : "bg-stone-200"}`} />
          ))}
        </div>

        <div className="relative p-8 md:p-12">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
            {/* Art */}
            <div className="md:col-span-2 flex justify-center">
              <div className="h-44 w-44 rounded-[2rem] bg-[#F9F8F6] border border-stone-200 flex items-center justify-center">
                <Art className="h-20 w-20 text-stone-800" style={{ opacity: 0.7 }} />
              </div>
            </div>
            {/* Content */}
            <div className="md:col-span-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 font-semibold">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl leading-tight">
                {cur.title.includes("RouteMe") ? (
                  <>Welcome to <span className="font-serif-i text-[#D95D39]">RouteMe</span></>
                ) : (
                  cur.title
                )}
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed">{cur.body}</p>

              <div className="mt-8 flex items-center gap-3">
                <button onClick={finish} data-testid="tour-skip" className="text-sm text-stone-500 hover:text-stone-900">
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
        </div>

        <button onClick={finish} className="absolute top-6 right-6 h-8 w-8 rounded-full hover:bg-stone-100 text-stone-400 flex items-center justify-center" data-testid="tour-close">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}