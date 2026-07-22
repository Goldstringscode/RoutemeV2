import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, Smartphone, ShieldCheck, Download, ArrowRight, ArrowLeft } from "lucide-react";

const MOCK_SECRET = "JBSWY3DPEHPK3PXP";
const MOCK_CODES = ["4A2F-9K1M", "P4X7-Q8VN", "H3ZL-M6BK", "T9RW-2CDE", "N8YQ-5FUP", "V1SB-XA0R", "K7MJ-DE23", "W3PC-N4Q8"];

export default function MFASetup() {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(MOCK_SECRET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900">
      <header className="border-b border-stone-200 bg-[#F9F8F6]/80 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-xl bg-stone-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold">RouteMe</span>
          </Link>
          <Link to="/app/profile" className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Skip for now
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-6 lg:px-10 py-14">
        <div className="flex items-center gap-2 text-xs">
          {[1, 2, 3].map((n) => (
            <React.Fragment key={n}>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest font-semibold ${
                n === step ? "bg-stone-900 text-white" :
                n < step ? "bg-[#E3ECE5] text-emerald-800 border border-emerald-100" :
                "bg-stone-100 text-stone-500 border border-stone-200"
              }`}>
                {n < step && <Check className="h-3 w-3" />}
                Step {n}
              </span>
              {n < 3 && <span className="text-stone-300">→</span>}
            </React.Fragment>
          ))}
        </div>

        <h1 className="mt-6 font-display text-5xl leading-tight">
          Add <span className="font-serif-i text-[#D95D39]">MFA</span>.
        </h1>
        <p className="mt-3 text-stone-600">One extra tap on your phone. Every unauthorized login blocked before it starts.</p>

        {step === 1 && (
          <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-8" data-testid="mfa-step-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Step 1 of 3</p>
                <h2 className="font-display text-xl">Install an authenticator</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-stone-600">
              Use any TOTP-compatible app on your phone: <strong>1Password, Google Authenticator, Authy, or Microsoft Authenticator</strong>. If you already have one, jump to step 2.
            </p>
            <div className="mt-6 flex gap-3">
              <button data-testid="mfa-next-1" onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold">
                I have one · continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-8" data-testid="mfa-step-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Step 2 of 3</p>
                <h2 className="font-display text-xl">Scan or enter this code</h2>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 items-center">
              <div className="col-span-1">
                <div className="aspect-square rounded-2xl border-4 border-stone-900 bg-white p-3 grid grid-cols-8 grid-rows-8 gap-0.5">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={`rounded-[1px] ${((i * 37) % 3 === 0) ? "bg-stone-900" : "bg-transparent"}`} />
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Or type the setup key</p>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <code className="flex-1 font-mono text-sm tracking-widest" data-testid="mfa-secret">{MOCK_SECRET}</code>
                  <button onClick={copy} data-testid="mfa-copy" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900">
                    {copied ? <><Check className="h-3.5 w-3.5 text-emerald-600" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                  </button>
                </div>
                <p className="mt-3 text-xs text-stone-500">
                  This 6-digit code refreshes every 30 seconds on your device.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Enter the 6-digit code from your app</label>
              <input
                data-testid="mfa-verify-input"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                className="mt-1.5 w-full h-14 rounded-xl border border-stone-200 bg-white px-4 text-2xl tracking-[0.5em] font-display text-center focus:border-stone-500 focus:outline-none focus:ring-4 focus:ring-stone-100"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="text-sm text-stone-500 hover:text-stone-900">← Back</button>
              <button onClick={() => setStep(3)} data-testid="mfa-next-2" disabled={code.length !== 6} className={`ml-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${code.length === 6 ? "bg-[#D95D39] hover:bg-[#C05030] text-white" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}>
                Verify & continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-8" data-testid="mfa-step-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#E3ECE5] text-emerald-700 flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Step 3 of 3</p>
                <h2 className="font-display text-xl">Save your backup codes</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-stone-600">
              Store these somewhere safe (password manager, encrypted note). Each code works <strong>once</strong> if you lose your phone.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 font-mono">
              {MOCK_CODES.map((c) => (
                <div key={c} className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center text-sm tabular-nums" data-testid={`mfa-code-${c}`}>
                  {c}
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button data-testid="mfa-download-codes" className="inline-flex items-center gap-2 rounded-full border border-stone-200 hover:bg-stone-100 text-stone-700 px-4 py-2 text-xs font-semibold">
                <Download className="h-3.5 w-3.5" /> Download codes
              </button>
              <Link to="/app/dashboard" data-testid="mfa-finish" className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold">
                Finish · MFA enabled <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
