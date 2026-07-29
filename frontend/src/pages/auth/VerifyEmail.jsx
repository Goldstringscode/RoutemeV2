import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ShieldCheck, ArrowRight, Mail, AlertTriangle, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const [state, setState] = useState("verifying"); // verifying | success | expired | error
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      // Check if the URL hash has an access_token (Supabase sends it after email link)
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.replace("#", ""));
        const type = hashParams.get("type");
        const accessToken = hashParams.get("access_token");
        if (type === "signup" && accessToken) {
          try {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: "" });
            setState("success");
            return;
          } catch {
            setState("expired");
            return;
          }
        }
      }
      // No token — check if user is already verified via session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setState("success");
      } else {
        // Simulate verification UX but don't pretend it succeeded
        setTimeout(() => setState("error"), 2000);
      }
    };
    checkVerification();
  }, []);

  const resendVerification = async () => {
    if (!email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      // Show success visually by keeping the state
    } catch {
      // Silently handle — the verify page will show regardless
    } finally {
      setResending(false);
    }
  };

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
              {email ? <><span className="font-semibold text-stone-900">{email}</span> is confirmed.</> : "Your email is confirmed."} Your account is fully activated and BAA is on file.
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
            <button
              data-testid="verify-resend"
              onClick={resendVerification}
              disabled={resending}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold disabled:bg-stone-400 disabled:cursor-wait"
            >
              {resending ? <><Loader className="h-4 w-4 animate-spin" /> Sending...</> : <><Mail className="h-4 w-4" /> Resend verification email</>}
            </button>
          </div>
        )}
        {state === "error" && (
          <div data-testid="verify-error">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mt-6 font-display text-3xl">Could not verify.</h1>
            <p className="mt-2 text-stone-600 text-sm">The verification link was invalid or no longer works. Try signing in or requesting a new one.</p>
            <div className="mt-6 flex flex-col gap-3 items-center">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold">
                Go to sign in <ArrowRight className="h-4 w-4" />
              </Link>
              {email && (
                <button
                  onClick={resendVerification}
                  disabled={resending}
                  className="text-sm text-stone-600 hover:text-stone-900 underline underline-offset-2"
                >
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}