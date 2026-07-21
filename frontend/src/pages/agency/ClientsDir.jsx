import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRouteMe } from "@/context/RouteMeContext";
import { Search, MapPin, User, Eye, EyeOff, Lock, Phone, MessageSquare, ChevronDown, ArrowUpRight } from "lucide-react";

export default function AgencyClientsDir() {
  const { nurses, agencyClients } = useRouteMe();
  const [q, setQ] = useState("");
  const [nurseId, setNurseId] = useState("all");
  const [reveal, setReveal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const maskName = (name) => {
    const parts = name.split(" ");
    const first = parts[0] || "";
    const last = parts.slice(1).join(" ");
    if (!first) return name;
    return `${first[0]}${"•".repeat(Math.max(3, first.length - 1))} ${last}`;
  };

  const filtered = useMemo(() => {
    return agencyClients.filter((c) => {
      if (nurseId !== "all" && c.nurseId !== nurseId) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.city.toLowerCase().includes(q.toLowerCase()) ||
        c.condition.toLowerCase().includes(q.toLowerCase())
      );
    });
  }, [agencyClients, q, nurseId]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
          Clients directory
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          Every person, <span className="font-serif-i text-[#7FA08B]">every nurse</span>.
        </h1>
        <p className="mt-2 text-stone-600 flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-stone-400" />
          {agencyClients.length} clients across your agency · PHI masked by default
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            data-testid="ac-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, city, condition"
            className="w-full h-11 rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100"
          />
        </div>
        <select
          data-testid="ac-nurse-filter"
          value={nurseId}
          onChange={(e) => setNurseId(e.target.value)}
          className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm outline-none"
        >
          <option value="all">All nurses ({nurses.length})</option>
          {nurses.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
        <button
          data-testid="reveal-phi-btn"
          onClick={() => setReveal((r) => !r)}
          className={`inline-flex items-center gap-2 h-11 rounded-full px-4 text-xs font-semibold transition-colors border ${
            reveal
              ? "bg-[#F7E5DD] text-[#D95D39] border-[#F0D2C4]"
              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
          }`}
        >
          {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {reveal ? "Hide PHI" : "Reveal PHI"}
        </button>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 font-semibold bg-[#F9F8F6] border-b border-stone-200">
              <th className="py-3 px-5">Client</th>
              <th className="py-3 px-5">Assigned nurse</th>
              <th className="py-3 px-5">Condition</th>
              <th className="py-3 px-5">Location</th>
              <th className="py-3 px-5 text-right">Visits · week</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {filtered.map((c) => {
              const nurse = nurses.find((n) => n.id === c.nurseId);
              const initials = c.name
                .split(" ")
                .map((s) => s[0])
                .join(".")
                .toUpperCase() + ".";
              const isExpanded = expandedId === c.id;

              return (
                <React.Fragment key={c.id}>
                  <tr
                    onClick={() => toggleExpand(c.id)}
                    className="hover:bg-stone-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#EFE9DF] border border-stone-200 text-stone-800 flex items-center justify-center text-[11px] font-semibold shrink-0">
                          {initials.slice(0, 3)}
                        </div>
                        <p className="font-semibold tabular-nums">
                          {reveal ? c.name : maskName(c.name)}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {nurse ? (
                        <div className="inline-flex items-center gap-2 text-stone-700">
                          <User className="h-3.5 w-3.5 text-stone-400" />
                          {nurse.name.split(",")[0]}
                        </div>
                      ) : (
                        <span className="text-stone-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-stone-700">{c.condition}</td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 text-stone-600">
                        <MapPin className="h-3.5 w-3.5 text-stone-400" /> {c.city}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#F7E5DD] text-[#D95D39] font-semibold text-xs">
                          {c.visitsWeek}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {isExpanded && (
                    <tr className="bg-[#F9F8F6]">
                      <td colSpan="5" className="p-0">
                        <div className="border-t border-stone-200 px-5 py-5 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="grid md:grid-cols-3 gap-4">
                            {/* Quick actions */}
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-2">
                                Quick actions
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <a
                                  href={`tel:${c.phone?.replace(/\D/g, "")}`}
                                  data-testid={`ac-call-${c.id}`}
                                  className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2 text-xs font-semibold transition-colors"
                                >
                                  <Phone className="h-3.5 w-3.5" /> Call
                                </a>
                                <a
                                  href={`sms:${c.phone?.replace(/\D/g, "")}`}
                                  data-testid={`ac-text-${c.id}`}
                                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 hover:bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-800 transition-colors"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" /> Text
                                </a>
                              </div>
                            </div>

                            {/* Contact info */}
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-2">
                                Contact
                              </p>
                              <p className="text-sm text-stone-700 flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                {c.address || "No address on file"}
                              </p>
                              {c.phone && (
                                <p className="text-sm text-stone-700 flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                  {c.phone}
                                </p>
                              )}
                            </div>

                            {/* View profile */}
                            <div className="flex items-end justify-end">
                              <Link
                                to={`/agency/clients/${c.id}`}
                                data-testid={`ac-view-profile-${c.id}`}
                                className="inline-flex items-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
                              >
                                View full profile <ArrowUpRight className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="py-10 text-center text-stone-500">
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}