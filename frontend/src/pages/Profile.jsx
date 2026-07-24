import React, { useState } from "react";
import { Shield, Trash2, Bell, Volume2, MapPin, HeartPulse, Home, Map } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { Switch } from "@/components/ui/switch";

export default function Profile() {
  const { nurse, audit, clients, notes, updateNurseHomeBase, navPreference, setNavPreference } = useRouteMe();
  const totalNotes = Object.values(notes).reduce((s, arr) => s + arr.length, 0);
  const [editingHome, setEditingHome] = useState(false);
  const [homeAddress, setHomeAddress] = useState(nurse.homeBase?.address || "");
  const [homeLat, setHomeLat] = useState(nurse.homeBase?.lat || 34.05);
  const [homeLng, setHomeLng] = useState(nurse.homeBase?.lng || -118.24);

  const handleSaveHome = () => {
    const hb = {
      address: homeAddress,
      lat: parseFloat(homeLat),
      lng: parseFloat(homeLng),
    };
    updateNurseHomeBase(hb);
    setEditingHome(false);
  };

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
        <MiniStat label="Miles saved / wk" value={nurse.weeklySavedMiles} />
      </div>

      {/* Home Base */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-[#D95D39]" />
              <h3 className="font-display text-xl">Home Base</h3>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              Your starting location. All routes begin from here.
            </p>
          </div>
          {!editingHome && (
            <button
              onClick={() => {
                setHomeAddress(nurse.homeBase?.address || "");
                setHomeLat(nurse.homeBase?.lat || 34.05);
                setHomeLng(nurse.homeBase?.lng || -118.24);
                setEditingHome(true);
              }}
              className="text-sm text-[#D95D39] hover:text-[#c04d2a] font-semibold"
            >
              Edit
            </button>
          )}
        </div>

        {editingHome ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1 uppercase tracking-wider">
                Address
              </label>
              <input
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="123 Main St, City, State ZIP"
                className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 focus:border-[#D95D39] font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 uppercase tracking-wider">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={homeLat}
                  onChange={(e) => setHomeLat(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 focus:border-[#D95D39] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 uppercase tracking-wider">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={homeLng}
                  onChange={(e) => setHomeLng(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-[#F9F8F6] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 focus:border-[#D95D39] font-mono"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveHome}
                className="rounded-xl bg-[#D95D39] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#c04d2a] transition-colors"
              >
                Save home base
              </button>
              <button
                onClick={() => setEditingHome(false)}
                className="text-sm text-stone-500 hover:text-stone-700 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-[#F9F8F6] border border-stone-200 p-4">
            <div className="h-10 w-10 rounded-xl bg-[#D95D39]/10 border border-[#D95D39]/20 flex items-center justify-center">
              <Map className="h-5 w-5 text-[#D95D39]" />
            </div>
            <div>
              <p className="font-semibold text-sm">{nurse.homeBase?.address || "Not set"}</p>
              <p className="text-xs text-stone-500 font-mono">
                {nurse.homeBase?.lat?.toFixed(4)}, {nurse.homeBase?.lng?.toFixed(4)}
              </p>
            </div>
          </div>
        )}
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

                {/* Navigation preference */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#F9F8F6] border border-stone-200 flex items-center justify-center">
                      <Map className="h-4 w-4 text-stone-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Default navigation app</p>
                      <p className="text-sm text-stone-500 mt-0.5">
                        Choose which map app to use when opening directions for a client stop.
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        {["google", "apple", "both"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setNavPreference(opt)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                              navPreference === opt
                                ? "bg-[#D95D39] text-white border-[#D95D39]"
                                : "bg-white text-stone-700 border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            {opt === "google" ? "Google Maps" : opt === "apple" ? "Apple Maps" : "Both"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
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
