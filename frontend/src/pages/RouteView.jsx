import React, { useState } from "react";
import StylizedMap from "@/components/StylizedMap";
import { useRouteMe } from "@/context/RouteMeContext";
import { Sparkles, Clock, MapPin, Mic, Phone, ChevronRight, Fuel, Route } from "lucide-react";

export default function RouteView() {
  const { schedule, optimize, optimized, openVoice } = useRouteMe();
  const [selected, setSelected] = useState(schedule[0]?.id);

  const active = schedule.find((s) => s.id === selected) || schedule[0];
  const totalMin = schedule.reduce((s, c) => s + (c.duration || 30), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Route · Today
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            {schedule.length} stops, <span className="font-serif-i text-[#D95D39]">one calm ribbon</span>.
          </h1>
        </div>
        <button
          onClick={optimize}
          data-testid="optimize-btn"
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
            optimized
              ? "bg-white border border-stone-200 text-stone-700"
              : "bg-[#D95D39] hover:bg-[#C05030] text-white"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {optimized ? "Route optimized" : "Re-optimize route"}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Map */}
        <div className="lg:col-span-8 space-y-4">
          <StylizedMap onStopClick={setSelected} />

          {/* Route summary strip */}
          <div className="grid grid-cols-4 gap-3">
            <SumCard icon={Route} label="Distance" value="34.2 mi" tone="ink" />
            <SumCard icon={Clock} label="Drive time" value="1h 08m" tone="ink" />
            <SumCard icon={Fuel} label="Fuel saved" value="+8.4%" tone="terra" />
            <SumCard icon={Sparkles} label="Time saved" value="27 min" tone="sage" />
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold px-1">
              Turn-by-turn timeline
            </p>
            <ol className="mt-4 relative">
              <span className="absolute left-[19px] top-4 bottom-4 w-px bg-stone-200" />
              {schedule.map((c, idx) => {
                const isActive = c.id === selected;
                return (
                  <li key={c.id} className="relative">
                    <button
                      data-testid={`timeline-stop-${idx + 1}`}
                      onClick={() => setSelected(c.id)}
                      className={`w-full text-left flex items-start gap-3 px-2 py-3 rounded-xl transition-colors ${
                        isActive ? "bg-[#F7E5DD]" : "hover:bg-stone-50"
                      }`}
                    >
                      <span
                        className={`relative z-10 h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-semibold text-sm ${
                          isActive
                            ? "bg-[#D95D39] text-white"
                            : "bg-white border border-stone-300 text-stone-800"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{c.fullName}</p>
                          <span className="text-[10px] uppercase tracking-widest text-stone-400">
                            · {c.duration}m
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> {c.window}
                        </p>
                        <p className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {c.address}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-stone-400 mt-3" />
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between px-1">
              <span className="text-xs text-stone-500">Total care time</span>
              <span className="font-display text-lg">
                {Math.floor(totalMin / 60)}h {totalMin % 60}m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected client detail */}
      {active && (
        <div className="rounded-3xl border border-stone-200 bg-white p-6 rm-fade-up">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                Selected stop
              </p>
              <h3 className="font-display text-3xl mt-1">{active.fullName}</h3>
              <p className="text-sm text-stone-600 mt-1">{active.condition}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.flags.map((f) => (
                  <span
                    key={f}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#E3ECE5] text-emerald-900 border border-emerald-100"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Info label="Address" value={active.address} />
              <Info label="Time window" value={active.window} />
              <Info label="Last visit" value={active.lastVisit} />
            </div>

            <div className="flex md:flex-col gap-3 md:items-end justify-end">
              <a
                href={`tel:${active.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
              >
                <Phone className="h-4 w-4" /> {active.phone}
              </a>
              <button
                onClick={() => openVoice(active.id)}
                data-testid="route-voice-btn"
                className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold transition-colors"
              >
                <Mic className="h-4 w-4" /> Record visit note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SumCard({ icon: Icon, label, value, tone }) {
  const styles =
    tone === "terra"
      ? "bg-[#F7E5DD] border-[#F0D2C4] text-[#D95D39]"
      : tone === "sage"
        ? "bg-[#E3ECE5] border-emerald-200 text-emerald-800"
        : "bg-white border-stone-200 text-stone-900";
  return (
    <div className={`rounded-2xl border p-4 ${styles}`}>
      <Icon className="h-4 w-4" />
      <div className="mt-2 text-[10px] uppercase tracking-widest opacity-70 font-semibold">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
      <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-stone-800">{value}</div>
    </div>
  );
}
