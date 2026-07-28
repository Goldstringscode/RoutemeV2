import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/login" className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>

          {sent ? (
            <div className="mt-10 text-center" data-testid="forgot-sent">
              <div className="mx-auto h-16 w-16 rounded-full bg-[#E3ECE5] flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="mt-6 font-display text-4xl leading-tight">Check your inbox.</h1>
              <p className="mt-3 text-stone-600">
                If an account exists for <span className="font-semibold text-stone-900">{email}</span>, we&apos;ve sent a password reset link. It expires in 60 minutes.
              </p>
              <p className="mt-6 text-xs text-stone-500">
                Didn&apos;t get it? Check spam, then{" "}
                <button onClick={() => setSent(false)} data-testid="forgot-try-again" className="underline underline-offset-2 decoration-stone-300 hover:text-stone-900">try again</button>.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-10 text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">Recover access</p>
              <h1 className="mt-3 font-display text-5xl leading-tight">
                Forgot your <span className="font-serif-i text-[#D95D39]">password</span>?
              </h1>
              <p className="mt-3 text-stone-600">
                Enter the email tied to your account and we&apos;ll send a one-time reset link.
              </p>

              <form onSubmit={submit} className="mt-8 space-y-4" data-testid="forgot-form">
                <div>
                  <label className="text-xs font-semibold text-stone-700 tracking-wide">Email</label>
                  <div className="mt-1.5 flex items-center gap-2 h-12 rounded-xl border border-stone-200 bg-white px-3 focus-within:border-stone-500 focus-within:ring-4 focus-within:ring-stone-100">
                    <Mail className="h-4 w-4 text-stone-400" />
                    <input
                      data-testid="forgot-email"
                      required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@nurse.io"
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
                <button data-testid="forgot-submit" type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-12 text-sm font-semibold">
                  Send reset link <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <div className="hidden lg:flex bg-stone-900 relative overflow-hidden p-12 items-end">
        <div className="absolute -top-32 -right-16 h-96 w-96 rounded-full bg-[#D95D39]/40 blur-3xl" />
        <div className="relative text-white">
          <ShieldCheck className="h-8 w-8 text-[#F7E5DD]" />
          <h2 className="mt-6 font-display text-5xl leading-tight">
            Your data <span className="font-serif-i text-[#F7E5DD]">stays yours</span>.
          </h2>
          <p className="mt-4 text-white/60 max-w-md">
            RouteMe will never ask for your password by email or phone. Reset links expire in 60 minutes and can only be used once.
          </p>
        </div>
      </div>
    </div>
  );
}
