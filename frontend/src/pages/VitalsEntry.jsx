import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, HeartPulse, Thermometer, Droplet, Activity, Wind, Zap } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function VitalsEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, pushAudit } = useRouteMe();
  const client = clients.find((c) => c.id === id) ?? clients[0];

  const [vitals, setVitals] = useState({
    bpSys: "", bpDia: "", hr: "", temp: "", spo2: "", resp: "",
    glucose: "", pain: 0, weight: "", notes: "",
  });

  const upd = (k, v) => setVitals({ ...vitals, [k]: v });

  const save = (e) => {
    e.preventDefault();
    pushAudit(`Vitals recorded — ${client.fullName} · BP ${vitals.bpSys}/${vitals.bpDia}, HR ${vitals.hr}`, "vitals");
    navigate(`/app/clients/${client.id}`);
  };

  const flag = (k, val, min, max) => {
    if (!val) return "";
    const n = parseFloat(val);
    if (isNaN(n)) return "";
    return n < min || n > max ? "text-amber-600 border-amber-300 bg-amber-50" : "";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to={`/app/clients/${client.id}`} className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to client
      </Link>

      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Vitals & observations</p>
        <h1 className="font-display text-4xl leading-tight">
          Log <span className="font-serif-i text-[#D95D39]">this visit</span>.
        </h1>
        <p className="mt-2 text-stone-600 text-sm">{client.fullName} · {new Date().toLocaleString([], { weekday: "long", hour: "2-digit", minute: "2-digit" })}</p>
      </div>

      <form onSubmit={save} className="rounded-3xl border border-stone-200 bg-white p-8 space-y-6" data-testid="vitals-form">
        <Group icon={HeartPulse} title="Cardiovascular">
          <div className="grid grid-cols-3 gap-3">
            <Field label="BP · Systolic" unit="mmHg">
              <input data-testid="vitals-bp-sys" type="number" min="60" max="250" value={vitals.bpSys} onChange={(e) => upd("bpSys", e.target.value)} className={`${cls} ${flag("bpSys", vitals.bpSys, 90, 140)}`} placeholder="120" />
            </Field>
            <Field label="BP · Diastolic" unit="mmHg">
              <input data-testid="vitals-bp-dia" type="number" min="30" max="150" value={vitals.bpDia} onChange={(e) => upd("bpDia", e.target.value)} className={`${cls} ${flag("bpDia", vitals.bpDia, 60, 90)}`} placeholder="80" />
            </Field>
            <Field label="Heart rate" unit="bpm">
              <input data-testid="vitals-hr" type="number" min="30" max="220" value={vitals.hr} onChange={(e) => upd("hr", e.target.value)} className={`${cls} ${flag("hr", vitals.hr, 60, 100)}`} placeholder="72" />
            </Field>
          </div>
        </Group>

        <Group icon={Thermometer} title="Respiratory & temperature">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Temperature" unit="°F">
              <input data-testid="vitals-temp" type="number" step="0.1" value={vitals.temp} onChange={(e) => upd("temp", e.target.value)} className={`${cls} ${flag("temp", vitals.temp, 97, 99.5)}`} placeholder="98.6" />
            </Field>
            <Field label="SpO₂" unit="%">
              <input data-testid="vitals-spo2" type="number" min="70" max="100" value={vitals.spo2} onChange={(e) => upd("spo2", e.target.value)} className={`${cls} ${flag("spo2", vitals.spo2, 95, 100)}`} placeholder="98" />
            </Field>
            <Field label="Respiratory rate" unit="/min">
              <input data-testid="vitals-resp" type="number" min="6" max="60" value={vitals.resp} onChange={(e) => upd("resp", e.target.value)} className={`${cls} ${flag("resp", vitals.resp, 12, 20)}`} placeholder="16" />
            </Field>
          </div>
        </Group>

        <Group icon={Droplet} title="Metabolic">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Blood glucose" unit="mg/dL">
              <input data-testid="vitals-glucose" type="number" min="30" max="600" value={vitals.glucose} onChange={(e) => upd("glucose", e.target.value)} className={`${cls} ${flag("glucose", vitals.glucose, 80, 180)}`} placeholder="112" />
            </Field>
            <Field label="Weight" unit="lb">
              <input data-testid="vitals-weight" type="number" step="0.1" value={vitals.weight} onChange={(e) => upd("weight", e.target.value)} className={cls} placeholder="164.2" />
            </Field>
          </div>
        </Group>

        <Group icon={Zap} title="Pain assessment">
          <label className="text-xs font-semibold text-stone-700 tracking-wide">Pain · 0 (none) to 10 (severe)</label>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range" min="0" max="10" step="1" value={vitals.pain}
              onChange={(e) => upd("pain", parseInt(e.target.value, 10))}
              data-testid="vitals-pain"
              className="flex-1 accent-[#D95D39]"
            />
            <div className="w-16 h-14 rounded-xl border-2 border-[#D95D39]/40 bg-[#F7E5DD] flex items-center justify-center">
              <span className="font-display text-3xl text-[#D95D39] tabular-nums">{vitals.pain}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-1">
            <span>😊 None</span><span>😐 Moderate</span><span>😖 Severe</span>
          </div>
        </Group>

        <Group icon={Activity} title="Observations">
          <textarea
            data-testid="vitals-notes"
            rows={4} value={vitals.notes} onChange={(e) => upd("notes", e.target.value)}
            placeholder="Wound status, mental state, mobility, meals, medication compliance…"
            className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
          />
        </Group>

        <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
          <Link to={`/app/clients/${client.id}`} className="text-sm text-stone-600 hover:text-stone-900">Cancel</Link>
          <button type="submit" data-testid="vitals-save" className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold">
            <Save className="h-4 w-4" /> Save vitals
          </button>
        </div>
      </form>
    </div>
  );
}

const cls = "w-full h-12 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100 tabular-nums text-lg";

function Group({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-[#D95D39]" />
        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, unit, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-stone-700 tracking-wide">
        {label} <span className="text-stone-400 font-normal">({unit})</span>
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
