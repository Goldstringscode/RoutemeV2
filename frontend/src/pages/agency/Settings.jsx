import React, { useState } from "react";
import { Building2, Palette, Clock, Map, ShieldCheck, Save } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function AgencySettings() {
  const { agency } = useRouteMe();
  const [form, setForm] = useState({
    name: agency.name, brandColor: "#D95D39", phone: "(512) 555-0187",
    address: "1204 Congress Ave, Austin, TX 78701", tz: "America/Chicago",
    hoursStart: "06:00", hoursEnd: "20:00", holidays: "Christmas, New Year, Thanksgiving",
    zones: "Zone 1 · Downtown, Zone 3 · East, Zone 5 · North",
  });
  const [saved, setSaved] = useState(false);
  const upd = (k, v) => setForm({ ...form, [k]: v });

  const save = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Agency settings</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">Your <span className="font-serif-i text-[#D95D39]">agency</span>, configured.</h1>
      </div>

      <form onSubmit={save} className="space-y-4" data-testid="agency-settings-form">
        <Section icon={Building2} title="Identity">
          <Field label="Agency name" required>
            <input data-testid="setting-name" required value={form.name} onChange={(e) => upd("name", e.target.value)} className={cls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact phone">
              <input data-testid="setting-phone" value={form.phone} onChange={(e) => upd("phone", e.target.value)} className={cls} />
            </Field>
            <Field label="Timezone">
              <select value={form.tz} onChange={(e) => upd("tz", e.target.value)} className={cls}>
                {["America/Chicago", "America/Los_Angeles", "America/New_York", "America/Denver"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Business address">
            <input value={form.address} onChange={(e) => upd("address", e.target.value)} className={cls} />
          </Field>
        </Section>

        <Section icon={Palette} title="Branding">
          <Field label="Primary color">
            <div className="flex items-center gap-3">
              <input type="color" data-testid="setting-color" value={form.brandColor} onChange={(e) => upd("brandColor", e.target.value)} className="h-11 w-16 rounded-xl border border-stone-200 cursor-pointer" />
              <span className="font-mono text-sm text-stone-500">{form.brandColor}</span>
            </div>
          </Field>
          <Field label="Logo" hint="PNG or SVG, transparent background, min 512×512">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-stone-400" />
              </div>
              <button type="button" data-testid="setting-upload-logo" className="rounded-full border border-stone-300 hover:bg-stone-100 px-4 py-2 text-sm font-semibold">Upload logo</button>
            </div>
          </Field>
        </Section>

        <Section icon={Clock} title="Operating hours">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start of day"><input data-testid="setting-hours-start" type="time" value={form.hoursStart} onChange={(e) => upd("hoursStart", e.target.value)} className={cls} /></Field>
            <Field label="End of day"><input data-testid="setting-hours-end" type="time" value={form.hoursEnd} onChange={(e) => upd("hoursEnd", e.target.value)} className={cls} /></Field>
          </div>
          <Field label="Holidays" hint="Comma-separated"><input value={form.holidays} onChange={(e) => upd("holidays", e.target.value)} className={cls} /></Field>
        </Section>

        <Section icon={Map} title="Zones">
          <Field label="Care zones" hint="Comma-separated zone names">
            <textarea data-testid="setting-zones" rows={3} value={form.zones} onChange={(e) => upd("zones", e.target.value)} className={`${cls} h-auto py-3`} />
          </Field>
        </Section>

        <Section icon={ShieldCheck} title="Compliance">
          <Row label="HIPAA BAA" value="Signed · Feb 01, 2026" action={<a href="/legal/baa" className="text-sm font-semibold text-[#D95D39] hover:underline">View →</a>} />
          <Row label="MFA required for admins" value="Enforced" action={<span className="text-xs text-emerald-700 font-semibold">✓</span>} />
          <Row label="Audit log retention" value="6 years (HIPAA minimum)" />
        </Section>

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" data-testid="settings-save" className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold">
            <Save className="h-4 w-4" /> {saved ? "Saved" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

const cls = "w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100";
function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
      <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-[#D95D39]" /><p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{title}</p></div>
      {children}
    </div>
  );
}
function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-stone-700 tracking-wide flex items-center gap-1">{label}{required && <span className="text-[#D95D39]">*</span>}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}
function Row({ label, value, action }) {
  return (
    <div className="flex items-center gap-4 py-3 border-t border-stone-100 first:border-0 first:pt-0">
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold">{label}</p><p className="text-xs text-stone-500">{value}</p></div>
      {action}
    </div>
  );
}
