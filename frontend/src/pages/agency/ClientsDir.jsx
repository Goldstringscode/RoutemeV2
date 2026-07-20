import React, { useMemo, useState } from "react";
import { useRouteMe } from "@/context/RouteMeContext";
import { Search, MapPin, User } from "lucide-react";

export default function AgencyClientsDir() {
  const { nurses, agencyClients } = useRouteMe();
  const [q, setQ] = useState("");
  const [nurseId, setNurseId] = useState("all");

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
          Clients directory
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          Every person, <span className="font-serif-i text-[#7FA08B]">every nurse</span>.
        </h1>
        <p className="mt-2 text-stone-600">
          {agencyClients.length} clients across your agency. PHI shown as initials — full records accessible only through nurse app.
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
              return (
                <tr key={c.id} className="hover:bg-stone-50/50">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[#EFE9DF] border border-stone-200 text-stone-800 flex items-center justify-center text-[11px] font-semibold shrink-0">
                        {initials.slice(0, 3)}
                      </div>
                      <p className="font-semibold">{c.name}</p>
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
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#F7E5DD] text-[#D95D39] font-semibold text-xs">
                      {c.visitsWeek}
                    </span>
                  </td>
                </tr>
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
