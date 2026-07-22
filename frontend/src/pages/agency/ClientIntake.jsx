import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, MapPin, ShieldCheck, HeartPulse, Users, Save, ArrowLeft } from "lucide-react";

const STEPS = ["Identity", "Insurance", "Clinical", "Emergency"];

export default function ClientIntake() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "", lastName: "", dob: "", sex: "F", phone: "", email: "", address: "",
    insProvider: "", insPolicy: "", insGroup: "",
    conditions: "", meds: "", allergies: "",
    ecName: "", ecPhone: "", ecRelation: "Spouse",
    consent: false,
  });
  const upd = (k, v) => setForm({ ...form, [k]: v });

  const next = () => setStep(Math.min(step + 1, STEPS.length - 1));
  const prev = () => setStep(Math.max(step - 1, 0));

  const save = (e) => { e.preventDefault(); nav("/agency/clients"); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => nav(-1)} className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back</button>

      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Client intake</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">Welcome a <span className="font-serif-i text-[#D95D39]">new client</span>.</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-xs">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest font-semibold ${
              i === step ? "bg-stone-900 text-white" :
              i < step ? "bg-[#E3ECE5] text-emerald-800 border border-emerald-100" :
              "bg-stone-100 text-stone-500 border border-stone-200"
            }`}>{s}</span>
            {i < STEPS.length - 1 && <span className="text-stone-300">→</span>}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={save} className="rounded-3xl border border-stone-200 bg-white p-8 space-y-5" data-testid={`intake-step-${step}`}>
        {step === 0 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field icon={User} label="First name" required><input data-testid="intake-first" required value={form.firstName} onChange={(e) => upd("firstName", e.target.value)} className={cls} /></Field>
              <Field label="Last name" required><input data-testid="intake-last" required value={form.lastName} onChange={(e) => upd("lastName", e.target.value)} className={cls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of birth" required><input data-testid="intake-dob" required type="date" value={form.dob} onChange={(e) => upd("dob", e.target.value)} className={cls} /></Field>
              <Field label="Sex"><select value={form.sex} onChange={(e) => upd("sex", e.target.value)} className={cls}><option>F</option><option>M</option><option>Other</option></select></Field>
            </div>
            <Field icon={Phone} label="Phone" required><input data-testid="intake-phone" required value={form.phone} onChange={(e) => upd("phone", e.target.value)} className={cls} /></Field>
            <Field icon={Mail} label="Email"><input type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} className={cls} /></Field>
            <Field icon={MapPin} label="Home address" required><input data-testid="intake-address" required value={form.address} onChange={(e) => upd("address", e.target.value)} className={cls} /></Field>
          </>
        )}
        {step === 1 && (
          <>
            <Field icon={ShieldCheck} label="Insurance provider"><input data-testid="intake-ins-provider" value={form.insProvider} onChange={(e) => upd("insProvider", e.target.value)} placeholder="Medicare, Blue Cross, Aetna…" className={cls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Policy #"><input data-testid="intake-ins-policy" value={form.insPolicy} onChange={(e) => upd("insPolicy", e.target.value)} className={cls} /></Field>
              <Field label="Group #"><input value={form.insGroup} onChange={(e) => upd("insGroup", e.target.value)} className={cls} /></Field>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <Field icon={HeartPulse} label="Primary conditions"><textarea data-testid="intake-conditions" rows={3} value={form.conditions} onChange={(e) => upd("conditions", e.target.value)} placeholder="Type II Diabetes, Post-op knee replacement, etc." className={`${cls} h-auto py-3`} /></Field>
            <Field label="Current medications"><textarea rows={3} value={form.meds} onChange={(e) => upd("meds", e.target.value)} placeholder="Metformin 500mg BID, Lisinopril 10mg QAM…" className={`${cls} h-auto py-3`} /></Field>
            <Field label="Allergies"><input value={form.allergies} onChange={(e) => upd("allergies", e.target.value)} placeholder="Penicillin, latex, shellfish…" className={cls} /></Field>
          </>
        )}
        {step === 3 && (
          <>
            <Field icon={Users} label="Emergency contact name" required><input data-testid="intake-ec-name" required value={form.ecName} onChange={(e) => upd("ecName", e.target.value)} className={cls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" required><input data-testid="intake-ec-phone" required value={form.ecPhone} onChange={(e) => upd("ecPhone", e.target.value)} className={cls} /></Field>
              <Field label="Relation"><select value={form.ecRelation} onChange={(e) => upd("ecRelation", e.target.value)} className={cls}><option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Other</option></select></Field>
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 cursor-pointer">
              <input data-testid="intake-consent" type="checkbox" checked={form.consent} onChange={(e) => upd("consent", e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#D95D39]" />
              <div className="text-sm text-stone-700">Signed HIPAA privacy consent + Notice of Privacy Practices provided. Client authorizes RouteMe to process PHI on our agency&apos;s behalf.</div>
            </label>
          </>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
          {step > 0 && <button type="button" onClick={prev} data-testid="intake-prev" className="text-sm text-stone-600 hover:text-stone-900">← Back</button>}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} data-testid="intake-next" className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold">Continue →</button>
          ) : (
            <button type="submit" disabled={!form.consent} data-testid="intake-submit" className={`ml-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${form.consent ? "bg-[#D95D39] hover:bg-[#C05030] text-white" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}>
              <Save className="h-4 w-4" /> Create client
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const cls = "w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100";
function Field({ icon: Icon, label, required, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-stone-700 tracking-wide flex items-center gap-1.5">{Icon && <Icon className="h-3.5 w-3.5 text-stone-400" />}{label}{required && <span className="text-[#D95D39]">*</span>}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
