import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, HeartPulse, Pill, Activity, AlertTriangle, FileText, User, Calendar, ShieldCheck } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function CarePlan() {
  const { id } = useParams();
  const { clients } = useRouteMe();
  const client = clients.find((c) => c.id === id) ?? clients[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={`/app/clients/${client.id}`} className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to client
      </Link>

      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Care plan · read-only</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">{client.fullName}</h1>
        <p className="mt-2 text-stone-600 text-sm flex items-center gap-3">
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Plan effective Feb 01, 2026 – Apr 30, 2026</span>
          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Dr. Amanda Chen, PCP</span>
        </p>
        <p className="mt-2 text-xs text-stone-500 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Care plan created by the physician — nurses have read-only access
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card icon={HeartPulse} title="Diagnoses">
          <ul className="space-y-2 text-sm">
            <Item>Type II Diabetes Mellitus · E11.9</Item>
            <Item>Essential hypertension · I10</Item>
            <Item>Post-op right knee replacement · Z96.651</Item>
          </ul>
        </Card>
        <Card icon={Activity} title="Vitals target range">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-stone-100">
              <tr><td className="py-2 text-stone-500">BP</td><td className="py-2 font-mono tabular-nums text-right">≤ 130/80</td></tr>
              <tr><td className="py-2 text-stone-500">HR</td><td className="py-2 font-mono tabular-nums text-right">60–90 bpm</td></tr>
              <tr><td className="py-2 text-stone-500">Fasting glucose</td><td className="py-2 font-mono tabular-nums text-right">80–130 mg/dL</td></tr>
              <tr><td className="py-2 text-stone-500">Weight</td><td className="py-2 font-mono tabular-nums text-right">± 3 lb weekly</td></tr>
            </tbody>
          </table>
        </Card>

        <Card icon={Pill} title="Medications" wide>
          <ul className="divide-y divide-stone-100">
            {[
              { name: "Metformin 500mg", dose: "1 tab BID with meals", note: "Track for GI upset" },
              { name: "Lisinopril 10mg", dose: "1 tab QAM", note: "Hold if SBP < 100" },
              { name: "Warfarin 2mg", dose: "1 tab QHS", note: "INR check weekly" },
              { name: "Acetaminophen 500mg", dose: "PRN q6h for knee pain", note: "Max 3g/day" },
            ].map((m) => (
              <li key={m.name} className="py-3 flex items-start gap-3">
                <Pill className="h-4 w-4 text-[#D95D39] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-stone-500">{m.dose}</p>
                </div>
                <span className="text-xs text-stone-500 text-right shrink-0">{m.note}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={AlertTriangle} title="Precautions">
          <ul className="space-y-2 text-sm">
            <Item warn>Fall risk — use walker for ambulation</Item>
            <Item warn>Penicillin allergy — anaphylaxis history</Item>
            <Item warn>DNR on file · state form 4</Item>
          </ul>
        </Card>

        <Card icon={FileText} title="Nursing interventions">
          <ol className="space-y-2 text-sm list-decimal list-inside marker:text-stone-400">
            <li>Assess pain (0-10) at every visit; note wound status.</li>
            <li>Blood glucose check pre-lunch on M/W/F.</li>
            <li>Wound dressing change M/W/F with sterile technique.</li>
            <li>Reinforce PT exercises 3× daily as tolerated.</li>
            <li>Notify PCP if BP > 160/95 or glucose > 250 mg/dL.</li>
          </ol>
        </Card>

        <Card icon={FileText} title="Goals · 90 days" wide>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Goal label="A1C" target="< 7.5%" current="7.9%" />
            <Goal label="Ambulation" target="200 ft indep." current="120 ft" />
            <Goal label="Pain (avg)" target="≤ 3/10" current="4/10" />
          </div>
        </Card>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-[#FDFAF4] p-5 text-xs text-stone-700 leading-relaxed">
        <strong>Physician signature on file.</strong> This care plan was signed electronically by Dr. Amanda Chen on Feb 1, 2026. Nurses may not modify — request updates via the agency&apos;s clinical liaison.
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, children, wide }) {
  return (
    <div className={`rounded-2xl border border-stone-200 bg-white p-6 ${wide ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-[#D95D39]" />
        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Item({ children, warn }) {
  return (
    <li className={`flex items-start gap-2 ${warn ? "text-amber-800" : ""}`}>
      <span className={`h-1.5 w-1.5 rounded-full mt-2 shrink-0 ${warn ? "bg-amber-500" : "bg-stone-400"}`} />
      <span>{children}</span>
    </li>
  );
}

function Goal({ label, target, current }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
      <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</p>
      <p className="font-display text-2xl mt-1">{current}</p>
      <p className="text-xs text-stone-500 mt-1">Target · {target}</p>
    </div>
  );
}
