import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Users,
  Clock,
  Route,
  Activity,
  Award,
  TrendingUp,
} from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

const STATUS_STYLES = {
  active: "bg-[#E3ECE5] text-emerald-800 border-emerald-100",
  pending: "bg-[#F7E5DD] text-[#D95D39] border-[#F0D2C4]",
  inactive: "bg-stone-100 text-stone-500 border-stone-200",
};

export default function NurseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nurses, agencyClients, liveActivity, setNurseStatus } = useRouteMe();

  const nurse = nurses.find((n) => n.id === id);
  if (!nurse) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-stone-500 mb-4">Nurse not found in your roster.</p>
        <Link to="/agency/nurses" className="text-[#D95D39] font-semibold hover:underline">
          Back to roster
        </Link>
      </div>
    );
  }

  const assignedClients = agencyClients.filter((c) => c.nurseId === nurse.id);
  const activity = liveActivity.filter((a) => a.nurseId === nurse.id);
  const initials = nurse.name
    .split(" ")
    .map((s) => s[0])
    .filter((c) => /[A-Z]/i.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const savedHours = Math.floor(nurse.weeklySaved / 60);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        data-testid="nurse-back-btn"
        className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to nurses
      </button>

      {/* Header */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {nurse.avatar ? (
            <img
              src={nurse.avatar}
              alt=""
              className="h-24 w-24 rounded-3xl object-cover border border-stone-200 shrink-0"
            />
          ) : (
            <div className="h-24 w-24 rounded-3xl bg-[#EFE9DF] border border-stone-200 text-stone-800 font-display font-semibold text-3xl flex items-center justify-center shrink-0">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
              Nurse profile
            </p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight mt-1">{nurse.name}</h1>
            <p className="mt-2 text-stone-600">{nurse.role}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[nurse.status]}`}>
                {nurse.status}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full border border-stone-200 bg-white text-stone-700">
                {nurse.zone}
              </span>
              {nurse.complianceOk && (
                <span className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-800 inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Compliance clean
                </span>
              )}
            </div>
          </div>

          <div className="flex md:flex-col gap-2 md:items-end shrink-0">
            <a
              href="tel:5125550100"
              data-testid="nurse-call"
              className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
            <button
              data-testid="nurse-message"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 hover:bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors"
            >
              <MessageSquare className="h-4 w-4" /> Message
            </button>
            {nurse.status === "active" ? (
              <button
                onClick={() => setNurseStatus(nurse.id, "inactive")}
                data-testid="nurse-toggle-status"
                className="text-xs text-stone-500 hover:text-stone-900 mt-1"
              >
                Deactivate account
              </button>
            ) : (
              <button
                onClick={() => setNurseStatus(nurse.id, "active")}
                data-testid="nurse-toggle-status"
                className="text-xs text-emerald-700 hover:text-emerald-900 mt-1 font-semibold"
              >
                Activate account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Route} label="Visits today" value={nurse.visitsToday} tone="terra" />
        <MetricCard icon={Users} label="Assigned clients" value={assignedClients.length} />
        <MetricCard icon={Clock} label="Weekly saved" value={`${savedHours}h ${nurse.weeklySaved % 60}m`} tone="sage" />
        <MetricCard icon={TrendingUp} label="Efficiency" value="+8.4%" />
      </div>

      {/* Two-column body */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Contact */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4">
          <h3 className="font-display text-xl">Contact & credentials</h3>
          <InfoRow icon={Mail} label="Email" value={nurse.email} />
          <InfoRow icon={MapPin} label="Assigned zone" value={nurse.zone} />
          <InfoRow icon={Calendar} label="Onboarded" value={nurse.onboarded ?? "Invite pending"} />
          <InfoRow icon={Award} label="License" value="RN #2418906" />
          <InfoRow icon={ShieldCheck} label="MFA status" value={nurse.complianceOk ? "Enrolled" : "Not enrolled"} />
        </div>

        {/* Assigned clients */}
        <div className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl">Assigned clients</h3>
              <p className="text-sm text-stone-500 mt-0.5">{assignedClients.length} people in care</p>
            </div>
            <Link
              to="/agency/clients"
              className="text-sm font-semibold text-[#D95D39] hover:underline underline-offset-4"
            >
              View all →
            </Link>
          </div>
          {assignedClients.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-dashed border-stone-200 bg-[#F9F8F6] text-sm text-stone-500">
              No clients assigned yet.
            </div>
          ) : (
            <ul className="divide-y divide-stone-200">
              {assignedClients.map((c) => (
                <li key={c.id} className="py-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#EFE9DF] border border-stone-200 text-stone-800 flex items-center justify-center text-[11px] font-semibold">
                    {c.name.split(" ").map((s) => s[0]).join(".")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-stone-500 truncate">{c.condition}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#F7E5DD] text-[#D95D39] font-semibold text-xs">
                      {c.visitsWeek}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Activity feed */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-2xl">Recent activity</h3>
            <p className="text-sm text-stone-500 mt-0.5">Last 24 hours</p>
          </div>
          <Link
            to="/agency/activity"
            className="text-sm font-semibold text-[#D95D39] hover:underline underline-offset-4"
          >
            Full stream →
          </Link>
        </div>
        {activity.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed border-stone-200 bg-[#F9F8F6]">
            <Activity className="h-6 w-6 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-stone-500">No activity yet.</p>
          </div>
        ) : (
          <ol className="relative">
            <span className="absolute left-[19px] top-3 bottom-3 w-px bg-stone-200" />
            {activity.map((a, i) => (
              <li key={i} className="relative flex items-start gap-4 py-2.5">
                <span className="relative z-10 h-10 w-10 shrink-0 flex items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D95D39] ring-4 ring-white" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-500 tabular-nums">{a.t}</p>
                  <p className="text-sm text-stone-800 mt-0.5">{a.label}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const styles =
    tone === "terra"
      ? "bg-[#F7E5DD] border-[#F0D2C4] text-[#D95D39]"
      : tone === "sage"
        ? "bg-[#E3ECE5] border-emerald-100 text-emerald-800"
        : "bg-white border-stone-200 text-stone-900";
  return (
    <div className={`rounded-2xl border p-4 ${styles}`}>
      <Icon className="h-4 w-4 opacity-80" />
      <div className="text-[10px] uppercase tracking-widest opacity-70 font-semibold mt-3">
        {label}
      </div>
      <div className="font-display text-2xl mt-0.5 tabular-nums">{value}</div>
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
