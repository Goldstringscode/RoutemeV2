import React from "react";
import { Calendar, Clock, User, MapPin, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouteMe } from "@/context/RouteMeContext";

export default function Visits() {
  const { visits, schedule } = useRouteMe();

  const todayVisits = visits.filter(v => {
    const visitDate = new Date(v.date).toDateString();
    const today = new Date().toDateString();
    return visitDate === today;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
          Visits · Track Record
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          Visits <span className="font-serif-i text-[#7FA08B]">log</span>.
        </h1>
        <p className="mt-2 text-stone-600">
          {todayVisits.length} visit{todayVisits.length !== 1 ? "s" : ""} completed today
          {schedule.length > 0 && ` · ${schedule.length} on today's schedule`}
        </p>
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Today" value={todayVisits.length} />
        <MiniStat label="All time" value={visits.length} />
        <MiniStat label="On schedule" value={schedule.length} />
      </div>

      {/* Visit history */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <h3 className="font-display text-xl mb-1">Visit history</h3>
        <p className="text-sm text-stone-500 mb-5">Every completed visit, logged automatically.</p>

        {visits.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-stone-200" />
            <p className="font-display text-lg text-stone-400 mt-3">No visits recorded yet</p>
            <p className="text-sm text-stone-400 mt-1">
              Start a route on the route page and mark clients as visited — they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((v) => (
              <div
                key={v.id}
                className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-4 hover:bg-stone-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-[#E3ECE5] border border-emerald-200 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/app/clients/${v.clientId}`}
                      className="font-semibold text-sm hover:text-[#D95D39] transition-colors truncate"
                    >
                      {v.clientName || "Unknown client"}
                    </Link>
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold shrink-0">
                      {v.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {v.time}
                    </span>
                  </div>
                  {v.notes && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-stone-600 bg-[#F9F8F6] rounded-xl px-3 py-2">
                      <FileText className="h-3 w-3 mt-0.5 shrink-0 text-stone-400" />
                      {v.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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