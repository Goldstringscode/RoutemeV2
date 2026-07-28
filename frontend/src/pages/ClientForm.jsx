import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, User, MapPin, Phone, Mail, Pill, AlertTriangle, HeartPulse, ShieldCheck } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, addClient, updateClient } = useRouteMe();
  const existing = id ? clients.find((c) => c.id === id) : null;
  const [form, setForm] = useState(existing ?? {
    fullName: "", address: "", window: "08:00 – 10:00", priority: "medium",
    phone: "", careType: "General visit", flags: "", mrn: "",
  });

  const submit = (e) => {
    e.preventDefault();
    if (existing) updateClient(existing.id, form);
    else addClient(form);
    navigate("/app/clients");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/app/clients" className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> All clients
      </Link>

      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
          {existing ? "Edit client" : "New client"}
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          {existing ? "Update the record." : <>Add a new <span className="font-serif-i text-[#D95D39]">client</span>.</>}
        </h1>
        <p className="mt-2 text-stone-600 text-sm flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Every field is encrypted at rest · edits appear in your audit trail
        </p>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-stone-200 bg-white p-8 space-y-5" data-testid="client-form">
        <FormRow icon={User} label="Full legal name" required>
          <input data-testid="client-name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls} placeholder="Eleanor Mabry" />
        </FormRow>
        <FormRow icon={Mail} label="MRN">
          <input data-testid="client-mrn" value={form.mrn} onChange={(e) => setForm({ ...form, mrn: e.target.value })} className={inputCls} placeholder="MRN-A0421-EL (leave blank to auto-generate)" />
        </FormRow>
        <FormRow icon={MapPin} label="Address" required>
          <input data-testid="client-address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} placeholder="1204 Pecan Grove Ln, Austin, TX" />
        </FormRow>
        <FormRow icon={Phone} label="Phone">
          <input data-testid="client-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="(512) 555-0142" />
        </FormRow>
        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Visit window">
            <input data-testid="client-window" value={form.window} onChange={(e) => setForm({ ...form, window: e.target.value })} className={inputCls} placeholder="08:00 – 10:00" />
          </FormRow>
          <FormRow label="Priority">
            <select data-testid="client-priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputCls}>
              <option value="high">High · fall risk / palliative</option>
              <option value="medium">Medium · routine care</option>
              <option value="low">Low · check-in only</option>
            </select>
          </FormRow>
        </div>
        <FormRow icon={HeartPulse} label="Care type">
          <select data-testid="client-caretype" value={form.careType} onChange={(e) => setForm({ ...form, careType: e.target.value })} className={inputCls}>
            <option>General visit</option>
            <option>Post-op recovery</option>
            <option>Chronic disease management</option>
            <option>Wound care</option>
            <option>Palliative care</option>
            <option>Dementia care</option>
          </select>
        </FormRow>
        <FormRow icon={AlertTriangle} label="Care flags" hint="Comma-separated. E.g. Gate code #4821, Small dog, Fall risk">
          <textarea data-testid="client-flags" rows={3} value={form.flags} onChange={(e) => setForm({ ...form, flags: e.target.value })} className={`${inputCls} h-auto py-3`} />
        </FormRow>

        <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
          <Link to="/app/clients" className="text-sm text-stone-600 hover:text-stone-900">Cancel</Link>
          <button type="submit" data-testid="client-save" className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold">
            <Save className="h-4 w-4" /> {existing ? "Save changes" : "Add client"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100";

function FormRow({ icon: Icon, label, hint, required, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-stone-700 tracking-wide flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-stone-400" />}
        {label}
        {required && <span className="text-[#D95D39]">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}
