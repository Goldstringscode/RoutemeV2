import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Mic,
  StickyNote,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Pill,
  Activity,
} from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { formatTimeWindow } from "@/lib/utils";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, notes, openVoice, schedule } = useRouteMe();

  const client = clients.find((c) => c.id === id);
  if (!client) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-stone-500 mb-4">Client not found in your roster.</p>
        <Link to="/app/clients" className="text-[#D95D39] font-semibold hover:underline">
          Back to clients
        </Link>
      </div>
    );
  }

  const clientNotes = notes[client.id] ?? [];
  const isOnToday = schedule.find((c) => c.id === client.id);

  const timeline = [
    { d: "Today", label: "Scheduled visit", detail: formatTimeWindow(client.window), active: !!isOnToday },
    { d: "Yesterday", label: "Completed visit", detail: "vitals: BP 128/78 · pulse 72" },
    { d: "3 days ago", label: "Rx refill reminder logged", detail: "" },
    { d: "1 week ago", label: "Initial assessment", detail: "" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        data-testid="client-back-btn"
        className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to clients
      </button>

      {/* Header card */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="h-24 w-24 rounded-3xl bg-[#EFE9DF] border border-stone-200 text-stone-800 font-display font-semibold text-3xl flex items-center justify-center shrink-0">
            {client.initials.slice(0, 3)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
              Client profile
            </p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight mt-1">
              {client.fullName}
            </h1>
            <p className="mt-2 text-stone-600">{client.condition}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full border ${
                  client.priority === "high"
                    ? "bg-[#F7E5DD] text-[#D95D39] border-[#F0D2C4]"
                    : client.priority === "medium"
                      ? "bg-[#E3ECE5] text-emerald-900 border-emerald-100"
                      : "bg-stone-100 text-stone-600 border-stone-200"
                }`}
              >
                {client.priority} priority
              </span>
              {isOnToday && (
                <span className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800">
                  On today&apos;s route
                </span>
              )}
            </div>
          </div>

          <div className="flex md:flex-col gap-2 md:items-end shrink-0">
            <a
              href={`tel:${client.phone.replace(/\D/g, "")}`}
              data-testid="client-call"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 hover:bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
            <button
              onClick={() => openVoice(client.id)}
              data-testid="client-voice"
              className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <Mic className="h-4 w-4" /> Record note
            </button>
          </div>
        </div>
      </div>

      {/* Info + timeline grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Contact & meds */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4">
          <h3 className="font-display text-xl">Contact & context</h3>
          <InfoRow icon={Phone} label="Phone" value={client.phone} />
          <InfoRow icon={MapPin} label="Address" value={client.address} />
          <InfoRow icon={Calendar} label="Date of birth" value={client.dob} />
          <InfoRow icon={Clock} label="Preferred window" value={formatTimeWindow(client.window)} />
          <InfoRow icon={Activity} label="Last visit" value={client.lastVisit} />
        </div>

        {/* Care flags */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h3 className="font-display text-xl mb-4">Care flags</h3>
          <div className="flex flex-wrap gap-2">
            {client.flags.map((f) => (
              <span
                key={f}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E3ECE5] text-emerald-900 border border-emerald-100"
              >
                {f}
              </span>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-100 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <p className="mt-3 text-sm font-semibold text-amber-900">Fall-risk safeguards</p>
            <p className="text-xs text-amber-800 mt-0.5">
              Check clear path to door & use handrails. Escalate if patient reports dizziness.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
              Medications
            </p>
            {[
              { name: "Metformin 500mg", freq: "twice daily" },
              { name: "Lisinopril 10mg", freq: "morning" },
              { name: "Vitamin D 2000IU", freq: "with meal" },
            ].map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-3 rounded-xl bg-[#F9F8F6] border border-stone-200 px-3 py-2"
              >
                <Pill className="h-3.5 w-3.5 text-stone-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{m.name}</p>
                  <p className="text-[10px] text-stone-500">{m.freq}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h3 className="font-display text-xl mb-4">Visit timeline</h3>
          <ol className="relative">
            <span className="absolute left-[10px] top-2 bottom-2 w-px bg-stone-200" />
            {timeline.map((t, i) => (
              <li key={i} className="relative flex items-start gap-3 py-2.5">
                <span
                  className={`relative z-10 h-5 w-5 rounded-full flex items-center justify-center border-2 ${
                    t.active
                      ? "bg-[#D95D39] border-[#D95D39] text-white"
                      : "bg-white border-stone-300"
                  }`}
                >
                  {t.active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                    {t.d}
                  </p>
                  <p className="text-sm font-semibold text-stone-800 mt-0.5">{t.label}</p>
                  {t.detail && <p className="text-xs text-stone-500 mt-0.5">{t.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-2xl">Visit notes</h3>
            <p className="text-sm text-stone-500 mt-0.5">
              {clientNotes.length} note{clientNotes.length === 1 ? "" : "s"} · HIPAA encrypted
            </p>
          </div>
          <button
            onClick={() => openVoice(client.id)}
            className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2 text-sm font-semibold"
          >
            <Mic className="h-3.5 w-3.5" /> New note
          </button>
        </div>

        {clientNotes.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-stone-200 bg-[#F9F8F6]">
            <StickyNote className="h-6 w-6 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-stone-500">No notes yet — tap &quot;New note&quot; to record one.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {clientNotes.map((n) => (
              <li
                key={n.id}
                className="rounded-2xl border border-stone-200 bg-[#F9F8F6] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                    {new Date(n.date).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <ChevronRight className="h-3 w-3 text-stone-400" />
                </div>
                <p className="text-sm text-stone-800 leading-relaxed">{n.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-[#F9F8F6] border border-stone-200 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-stone-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</p>
        <p className="text-sm font-medium text-stone-800 truncate">{value}</p>
      </div>
    </div>
  );
}
