import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Lock, Globe, User, LogOut, Trash2, ChevronRight, Check } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function NurseSettings() {
  const { nurse, setAuthed } = useRouteMe();
  const [prefs, setPrefs] = useState({
    notifRoute: true, notifCompliance: true, notifMessages: true, notifMarketing: false,
    tz: "America/Chicago", locale: "en-US", phiMask: false, mfa: false,
  });

  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Settings</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          Your <span className="font-serif-i text-[#D95D39]">preferences</span>.
        </h1>
        <p className="mt-2 text-stone-600">Everything that shapes how RouteMe works for you.</p>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <Row label="Name" value={nurse.name} action={<Link to="/app/profile" className="text-sm font-semibold text-[#D95D39] hover:underline">Edit →</Link>} />
        <Row label="Email" value={nurse.email} action={<Link to="/app/profile" className="text-sm font-semibold text-[#D95D39] hover:underline">Change →</Link>} />
        <Row label="License" value={`${nurse.license} · ${nurse.licenseState}`} />
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <Toggle label="Route updates & optimizations" val={prefs.notifRoute} onToggle={() => toggle("notifRoute")} testId="setting-notif-route" />
        <Toggle label="Compliance & license reminders" val={prefs.notifCompliance} onToggle={() => toggle("notifCompliance")} testId="setting-notif-compliance" />
        <Toggle label="Messages from your agency" val={prefs.notifMessages} onToggle={() => toggle("notifMessages")} testId="setting-notif-messages" />
        <Toggle label="Product updates & newsletter" val={prefs.notifMarketing} onToggle={() => toggle("notifMarketing")} testId="setting-notif-marketing" hint="The monthly Route newsletter" />
      </Section>

      {/* Security */}
      <Section icon={Lock} title="Security">
        <Row label="Password" value="Last changed 30 days ago" action={<Link to="/auth/set-password" className="text-sm font-semibold text-[#D95D39] hover:underline">Change →</Link>} />
        <Row
          label="Two-factor authentication"
          value={prefs.mfa ? "Enrolled · using authenticator app" : "Not enrolled — recommended"}
          action={<Link to="/auth/mfa" data-testid="setting-mfa-link" className="text-sm font-semibold text-[#D95D39] hover:underline">{prefs.mfa ? "Manage →" : "Set up →"}</Link>}
        />
        <Toggle label="Hide PHI by default on shared screens" val={prefs.phiMask} onToggle={() => toggle("phiMask")} testId="setting-phi-mask" hint="Client names shown as initials until unlocked" />
      </Section>

      {/* Region */}
      <Section icon={Globe} title="Region & language">
        <Select label="Timezone" value={prefs.tz} onChange={(v) => setPrefs({ ...prefs, tz: v })} options={["America/Chicago", "America/Los_Angeles", "America/New_York", "America/Denver", "America/Phoenix"]} testId="setting-tz" />
        <Select label="Language" value={prefs.locale} onChange={(v) => setPrefs({ ...prefs, locale: v })} options={["en-US · English", "es-US · Español"]} testId="setting-locale" />
      </Section>

      {/* Data */}
      <Section icon={Trash2} title="Data & account">
        <Row label="Export my data" value="Download a copy of everything" action={<Link to="/settings/data" data-testid="setting-data-link" className="text-sm font-semibold text-[#D95D39] hover:underline">Manage →</Link>} />
        <Row label="Delete my account" value="Permanently anonymize" action={<Link to="/settings/data" className="text-sm font-semibold text-red-600 hover:underline">Delete →</Link>} />
      </Section>

      {/* Sign out */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <button
          data-testid="setting-signout"
          onClick={() => setAuthed(false)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-900 px-5 py-2.5 text-sm font-semibold"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#D95D39]" />
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">{title}</p>
      </div>
      <div className="divide-y divide-stone-100">{children}</div>
    </div>
  );
}

function Row({ label, value, action }) {
  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-900">{label}</p>
        <p className="text-xs text-stone-500 mt-0.5">{value}</p>
      </div>
      {action}
    </div>
  );
}

function Toggle({ label, hint, val, onToggle, testId }) {
  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-900">{label}</p>
        {hint && <p className="text-xs text-stone-500 mt-0.5">{hint}</p>}
      </div>
      <button
        onClick={onToggle}
        data-testid={testId}
        className={`h-6 w-11 rounded-full transition-colors relative ${val ? "bg-[#D95D39]" : "bg-stone-200"}`}
        aria-pressed={val}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${val ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function Select({ label, value, onChange, options, testId }) {
  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <p className="text-sm font-semibold text-stone-900 flex-1">{label}</p>
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
