import React, { useMemo } from "react";
import { Shield, Trash2, Bell, Volume2, MapPin, HeartPulse } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { MAP_STOPS } from "@/lib/mockData";
import { Switch } from "@/components/ui/switch";

/** Haversine distance between two lat/lng pairs in miles */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computeRouteStats(schedule, stopMap) {
  if (schedule.length < 2) return null;
  const ordered = schedule.map((c) => stopMap[c.id]).filter(Boolean);
  if (ordered.length < 2) return null;
  let total = 0;
  for (let i = 0; i < ordered.length - 1; i++) {
    total += haversine(ordered[i].lat, ordered[i].lng, ordered[i + 1].lat, ordered[i + 1].lng);
  }
  return Math.round(total * 10) / 10;
}

export default function Profile() {
  const { nurse, audit, clients, notes, schedule } = useRouteMe();
  const totalNotes = Object.values(notes).reduce((s, arr) => s + arr.length, 0);

  const stopMap = useMemo(() => Object.fromEntries(MAP_STOPS.map((s) => [s.id, s])), []);
  const routeMiles = useMemo(() => computeRouteStats(schedule, stopMap), [schedule, stopMap]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
          Profile · Preferences
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          Your <span className="font-serif-i text-[#D95D39]">workspace</span>.
        </h1>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 flex items-center gap-5">
        <img
          src={nurse.avatar}
          className="h-20 w-20 rounded-2xl border border-stone-200 object-cover"
          alt=""
        />
        <div>
          <h2 className="font-display text-2xl">{nurse.name}</h2>
          <p className="text-sm text-stone-600">{nurse.title}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-[#F9F8F6] border border-stone-200 text-stone-700">
              {nurse.license}
            </span>
            <span className="px-2 py-1 rounded-full bg-[#F9F8F6] border border-stone-200 text-stone-700">
              {nurse.region}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Active clients" value={clients.length} />
        <MiniStat label="Notes recorded" value={totalNotes} />
        <MiniStat label="Audit events" value={audit.length} />
        <MiniStat label="Route miles / day" value={routeMiles ?? "—"} />
      </div>

      {/* Preferences */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <h3 className="font-display text-xl mb-1">Preferences</h3>
        <p className="text-sm text-stone-500 mb-5">Tweak how RouteMe behaves on the road.</p>

        <div className="divide-y divide-stone-200">
          <Pref
            icon={Bell}
            title="Break reminders"
            desc="Suggest breaks based on route length and time driven."
            defaultOn
            testId="pref-breaks"
          />
          <Pref
            icon={Volume2}
            title="Voice cues between stops"
            desc="Read next client name and care flags aloud."
            testId="pref-voice"
          />
          <Pref
            icon={MapPin}
            title="Fuel-efficient routing"
            desc="Prefer routes with fewer idles and shorter mileage."
            defaultOn
            testId="pref-fuel"
          />
          <Pref
            icon={HeartPulse}
            title="Family visibility alerts"
            desc="Send opt-in ETAs to family contacts (mocked)."
            testId="pref-family"
          />
        </div>
      </div>

      {/* Compliance card */}
      <div className="rounded-3xl border border-stone-200 bg-stone-900 text-white p-6 relative overflow-hidden rm-grain">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <Shield className="h-6 w-6 text-emerald-400" />
        <h3 className="font-display text-2xl mt-4">HIPAA compliance status</h3>
        <p className="text-sm text-white/70 mt-1 max-w-lg">
          Encryption at rest and in transit · role-based PHI access · full session audit.
          You&apos;re operating within your organization&apos;s BAA scope.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          {["AES-256", "TLS 1.3", "SOC2 aligned", "Session audit", "MFA ready"].map((b) => (
            <span key={b} className="rounded-full border border-white/20 px-3 py-1">
              {b}
            </span>
          ))}
        </div>
      </div>

      <button
        data-testid="clear-data-btn"
        onClick={() => {
          if (window.confirm("Reset local prototype data?")) {
            localStorage.removeItem("routeme.state.v1");
            window.location.reload();
          }
        }}
        className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
      >
        <Trash2 className="h-4 w-4" /> Reset prototype data
      </button>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</div>
      <div className="font-display text-3xl mt-1">{value}</div>
    </div>
  );
}

function Pref({ icon: Icon, title, desc, defaultOn = false, testId }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="h-10 w-10 rounded-xl bg-[#F9F8F6] border border-stone-200 flex items-center justify-center">
        <Icon className="h-4 w-4 text-stone-700" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-stone-500 mt-0.5">{desc}</p>
      </div>
      <Switch data-testid={testId} checked={on} onCheckedChange={setOn} />
    </div>
  );
}