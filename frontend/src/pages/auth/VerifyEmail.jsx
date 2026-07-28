import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ShieldCheck, ArrowRight, Mail, AlertTriangle } from "lucide-react";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const email = params.get("email") || "priya@sunrisehh.demo";
  const [state, setState] = useState("verifying"); // verifying | success | expired

  useEffect(() => {
    const t = setTimeout(() => setState("success"), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center">
        {state === "verifying" && (
          <div data-testid="verify-loading">
            <div className="mx-auto h-16 w-16 rounded-full border-4 border-stone-200 border-t-[#D95D39] animate-spin" />
            <h1 className="mt-6 font-display text-3xl">Verifying your email…</h1>
            <p className="mt-2 text-stone-600 text-sm">One moment while we confirm the token.</p>
          </div>
        )}
        {state === "success" && (
          <div data-testid="verify-success">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#E3ECE5] flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="mt-6 font-display text-3xl leading-tight">
              You&apos;re <span className="font-serif-i text-[#D95D39]">verified</span>.
            </h1>
            <p className="mt-3 text-stone-600 text-sm">
              <span className="font-semibold text-stone-900">{email}</span> is confirmed. Your account is fully activated and BAA is on file.
            </p>
            <Link to="/login" data-testid="verify-continue" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold">
              Continue to sign in <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-6 text-xs text-stone-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              MFA is optional — recommended for admins
            </p>
          </div>
        )}
        {state === "expired" && (
          <div data-testid="verify-expired">
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="mt-6 font-display text-3xl">This link expired.</h1>
            <p className="mt-2 text-stone-600 text-sm">Verification links are valid for 24 hours. Request a fresh one below.</p>
            <button data-testid="verify-resend" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold">
              <Mail className="h-4 w-4" /> Resend verification email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
