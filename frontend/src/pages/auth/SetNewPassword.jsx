import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";

export default function SetNewPassword() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const valid = pw.length >= 8 && pw === confirm && /[A-Z]/.test(pw) && /[0-9]/.test(pw);

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    setDone(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8">
        {done ? (
          <div className="text-center py-6" data-testid="setpw-success">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#E3ECE5] flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="mt-5 font-display text-3xl">Password updated.</h1>
            <p className="mt-2 text-stone-600 text-sm">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-stone-900 flex items-center justify-center">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Set new password</p>
                <p className="text-xs text-stone-400 font-mono">Link expires in 58 min</p>
              </div>
            </div>
            <h1 className="mt-6 font-display text-3xl leading-tight">
              A fresh <span className="font-serif-i text-[#D95D39]">start</span>.
            </h1>
            <form onSubmit={submit} className="mt-6 space-y-4" data-testid="setpw-form">
              <Field label="New password" show={show} setShow={setShow} value={pw} onChange={setPw} testId="setpw-new" />
              <Field label="Confirm new password" show={show} setShow={setShow} value={confirm} onChange={setConfirm} testId="setpw-confirm" hideToggle />
              <Requirements pw={pw} confirm={confirm} />
              <button
                type="submit" disabled={!valid} data-testid="setpw-submit"
                className={`w-full inline-flex items-center justify-center gap-2 rounded-full h-12 text-sm font-semibold ${
                  valid ? "bg-[#D95D39] hover:bg-[#C05030] text-white" : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                Update password <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-xs text-stone-500 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Stored hashed with bcrypt · never in plaintext
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, show, setShow, value, onChange, testId, hideToggle }) {
  return (
    <div>
      <label className="text-xs font-semibold text-stone-700 tracking-wide">{label}</label>
      <div className="mt-1.5 relative flex items-center h-12 rounded-xl border border-stone-200 bg-white px-3 focus-within:border-stone-500 focus-within:ring-4 focus-within:ring-stone-100">
        <Lock className="h-4 w-4 text-stone-400" />
        <input
          data-testid={testId} required type={show ? "text" : "password"}
          value={value} onChange={(e) => onChange(e.target.value)}
          className="ml-2 flex-1 bg-transparent text-sm outline-none"
        />
        {!hideToggle && (
          <button type="button" onClick={() => setShow((s) => !s)} className="h-8 w-8 rounded-full hover:bg-stone-100 text-stone-400 flex items-center justify-center">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function Requirements({ pw, confirm }) {
  const items = [
    { ok: pw.length >= 8, label: "At least 8 characters" },
    { ok: /[A-Z]/.test(pw), label: "One uppercase letter" },
    { ok: /[0-9]/.test(pw), label: "One number" },
    { ok: pw && pw === confirm, label: "Passwords match" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-1.5">
      {items.map((it) => (
        <li key={it.label} className={`text-xs flex items-center gap-1.5 ${it.ok ? "text-emerald-600" : "text-stone-400"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${it.ok ? "bg-emerald-500" : "bg-stone-300"}`} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
