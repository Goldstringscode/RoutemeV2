import React, { useState, useEffect } from "react";
import { Phone, MessageSquare, Check, X, Route, Clock, Shuffle } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import ReassignDialog from "@/components/ReassignDialog";

// Positions per nurse on a 1000x600 stylized map (Austin metro spread)
const PIN_POSITIONS = {
  n_amara: { x: 320, y: 320 },
  n_marcus: { x: 500, y: 180 },
  n_devi: { x: 620, y: 400 },
  n_priya: { x: 780, y: 260 },
  n_jonah: { x: 200, y: 220 },
  n_derek: { x: 860, y: 460 },
};

const fallbackPos = (idx) => ({
  x: 180 + ((idx * 137) % 720),
  y: 180 + ((idx * 89) % 320),
});

// Random ambient shimmer so pins feel alive
function useShimmer() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3500);
    return () => clearInterval(id);
  }, []);
  return tick;
}

export default function CommandCenterMap() {
  const { nurses } = useRouteMe();
  const active = nurses.filter((n) => n.status === "active");
  const [selectedId, setSelectedId] = useState(null);
  const [messageSentId, setMessageSentId] = useState(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  useShimmer();

  const selected = active.find((n) => n.id === selectedId);

  const sendMessage = (id) => {
    setMessageSentId(id);
    setTimeout(() => setMessageSentId(null), 2200);
  };

  const posFor = (nurseId, idx) => PIN_POSITIONS[nurseId] || fallbackPos(idx);

  return (
    <div
      data-testid="command-center-map"
      className="relative overflow-hidden rounded-3xl border border-stone-200 bg-[#EFE9DF]"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 pointer-events-none">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-stone-600 font-semibold">
            Command center
          </p>
          <h3 className="font-display text-2xl leading-tight mt-0.5 text-stone-900">
            {active.length} nurses <span className="font-serif-i text-[#D95D39]">in the field</span>
          </h3>
        </div>
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-stone-200 px-3 py-1.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="rm-pulse-dot absolute h-2 w-2 rounded-full bg-emerald-500" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-600" />
          </span>
          <span className="font-semibold text-stone-700">Live · Austin metro</span>
        </div>
      </div>

      {/* Map background */}
      <div className="relative aspect-[16/8]">
        <div
          className="absolute inset-0 opacity-70 mix-blend-multiply"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1622593587600-919f704f4ba0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHx3YXJtJTIwYWJzdHJhY3QlMjBsaW5lJTIwYXJ0JTIwbWFwfGVufDB8fHx8MTc4NDIzMzQ5OXww&ixlib=rb-4.1.0&q=85)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#F9F8F6]/60 via-transparent to-[#D95D39]/10" />

        {/* SVG grid + connecting lines */}
        <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <g stroke="#1C1C1C" strokeOpacity="0.05" strokeWidth="1">
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={"v" + i} x1={i * 100} y1="0" x2={i * 100} y2="500" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={"h" + i} x1="0" y1={i * 100} x2="1000" y2={i * 100} />
            ))}
          </g>
          {/* Ambient connection lines between pins */}
          {active.slice(0, active.length - 1).map((n, i) => {
            const a = posFor(n.id, i);
            const b = posFor(active[i + 1].id, i + 1);
            return (
              <line
                key={n.id + "-conn"}
                x1={a.x}
                y1={a.y - 40}
                x2={b.x}
                y2={b.y - 40}
                stroke="#D95D39"
                strokeOpacity="0.12"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
            );
          })}
        </svg>

        {/* Pins */}
        {active.map((n, idx) => {
          const pos = posFor(n.id, idx);
          const isSelected = selectedId === n.id;
          return (
            <button
              key={n.id}
              data-testid={`map-pin-${n.id}`}
              onClick={() => setSelectedId(isSelected ? null : n.id)}
              className="absolute -translate-x-1/2 -translate-y-full group"
              style={{ left: `${(pos.x / 1000) * 100}%`, top: `${(pos.y / 500) * 100}%` }}
            >
              {/* Pulsing ring */}
              <span className="absolute inset-0 rounded-full">
                <span className="absolute -inset-2 rounded-full bg-[#D95D39]/25 animate-ping" style={{ animationDuration: "2.4s" }} />
              </span>

              {/* Pin body */}
              <div
                className={`relative flex items-center gap-2 rounded-full bg-white shadow-md border-2 transition-all duration-300 pl-1 pr-3 py-1 ${
                  isSelected
                    ? "border-[#D95D39] scale-105 shadow-lg"
                    : "border-white group-hover:border-[#D95D39]/60 group-hover:-translate-y-0.5"
                }`}
              >
                <NurseAvatar nurse={n} size={8} />
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-stone-800 leading-tight whitespace-nowrap">
                    {n.name.split(",")[0]}
                  </p>
                  <p className="text-[9px] text-stone-500 leading-tight whitespace-nowrap tracking-wider uppercase">
                    {n.zone.split(" · ")[0]}
                  </p>
                </div>
              </div>

              {/* Pin tail */}
              <svg
                className="absolute left-1/2 -translate-x-1/2 -bottom-2"
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="white"
              >
                <path
                  d="M0 0 L12 0 L6 8 Z"
                  stroke={isSelected ? "#D95D39" : "white"}
                  strokeWidth="1"
                />
              </svg>
            </button>
          );
        })}

        {/* Legend */}
        <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-stone-200 px-3 py-1.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-2 w-2 rounded-full bg-[#D95D39]/40 animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-[#D95D39]" />
          </span>
          <span className="text-stone-700 font-medium">
            {active.length} pins live · tap to reach out
          </span>
        </div>

        {/* Compass */}
        <div className="absolute right-4 bottom-4 h-11 w-11 rounded-full border border-stone-300 bg-white/90 backdrop-blur flex items-center justify-center">
          <div className="relative">
            <div className="text-[10px] font-bold text-[#D95D39] absolute -top-3 left-1/2 -translate-x-1/2">N</div>
            <div className="h-5 w-0.5 bg-stone-800" />
          </div>
        </div>
      </div>

      {/* Selected pin card */}
      {selected && (
        <div
          data-testid="pin-card"
          className="absolute z-30 top-20 right-6 w-80 rounded-2xl border border-stone-200 bg-white shadow-xl rm-fade-up overflow-hidden"
        >
          <div className="flex items-start gap-3 p-4 border-b border-stone-200">
            <NurseAvatar nurse={selected} size={12} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate">{selected.name}</p>
                <span className="relative flex h-2 w-2">
                  <span className="rm-pulse-dot absolute h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-600" />
                </span>
              </div>
              <p className="text-xs text-stone-500 truncate">{selected.zone}</p>
              <p className="text-xs text-stone-500 truncate">{selected.role}</p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              data-testid="pin-close"
              className="h-7 w-7 rounded-full hover:bg-stone-100 flex items-center justify-center"
            >
              <X className="h-3.5 w-3.5 text-stone-500" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {selected.currentStop && (
              <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                  <Route className="h-3 w-3" /> Currently
                </div>
                <div className="mt-1 text-sm font-semibold text-stone-800">{selected.currentStop}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
                <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                  Visits today
                </div>
                <div className="font-display text-xl mt-0.5 tabular-nums">{selected.visitsToday}</div>
              </div>
              <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
                <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Active
                </div>
                <div className="font-display text-xl mt-0.5">{selected.lastActive}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                data-testid={`pin-call-${selected.id}`}
                href={`tel:5125550100`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-10 text-xs font-semibold transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              <button
                data-testid={`pin-message-${selected.id}`}
                onClick={() => sendMessage(selected.id)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 hover:bg-stone-50 h-10 text-xs font-semibold text-stone-800 transition-colors"
              >
                {messageSentId === selected.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Sent
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-3.5 w-3.5" /> Message
                  </>
                )}
              </button>
            </div>

            <button
              data-testid={`pin-reassign-${selected.id}`}
              onClick={() => setReassignOpen(true)}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white h-10 text-xs font-semibold transition-colors"
            >
              <Shuffle className="h-3.5 w-3.5" /> Reassign visit
            </button>

            <p className="text-[10px] text-stone-400 text-center pt-1">
              Encrypted · call & message routed through agency BAA
            </p>
          </div>
        </div>
      )}

      <ReassignDialog
        open={reassignOpen}
        onOpenChange={setReassignOpen}
        fromNurseId={selected?.id}
      />
    </div>
  );
}

function NurseAvatar({ nurse, size = 8 }) {
  const initials = nurse.name
    .split(" ")
    .map((s) => s[0])
    .filter((c) => /[A-Z]/i.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const cls = size === 12 ? "h-12 w-12" : size === 10 ? "h-10 w-10" : "h-8 w-8";
  if (nurse.avatar) {
    return (
      <img
        src={nurse.avatar}
        alt=""
        className={`${cls} rounded-full object-cover border border-stone-200 shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${cls} rounded-full bg-[#EFE9DF] border border-stone-200 text-stone-800 flex items-center justify-center font-semibold shrink-0`}
      style={{ fontSize: size === 12 ? 12 : 10 }}
    >
      {initials}
    </div>
  );
}
