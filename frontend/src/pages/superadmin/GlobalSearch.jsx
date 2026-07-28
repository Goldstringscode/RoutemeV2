import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Building2, Users, UserRound, ScrollText, ArrowRight } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function GlobalSearch() {
  const [params] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const { agencies, globalNurses, globalClients, globalAudit } = useRouteMe();

  const results = useMemo(() => {
    if (!q) return { agencies: [], nurses: [], clients: [], audit: [] };
    const s = q.toLowerCase();
    return {
      agencies: agencies.filter(a => a.name.toLowerCase().includes(s) || a.city.toLowerCase().includes(s)).slice(0, 5),
      nurses: globalNurses.filter(n => n.name.toLowerCase().includes(s) || n.email.toLowerCase().includes(s) || n.zone.toLowerCase().includes(s)).slice(0, 5),
      clients: globalClients.filter(c => c.fullName.toLowerCase().includes(s) || c.mrn.toLowerCase().includes(s)).slice(0, 5),
      audit: globalAudit.filter(a => a.actorName.toLowerCase().includes(s) || a.action.toLowerCase().includes(s) || a.resource.toLowerCase().includes(s)).slice(0, 5),
    };
  }, [q, agencies, globalNurses, globalClients, globalAudit]);

  const total = results.agencies.length + results.nurses.length + results.clients.length + results.audit.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">Search</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">Find <span className="font-serif-i text-[#D95D39]">anything</span>.</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
        <input
          autoFocus data-testid="gs-input" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search agencies, nurses, clients, audit events, MRNs, IPs…"
          className="w-full h-14 rounded-full border border-white/10 bg-white/5 pl-14 pr-4 text-base text-white placeholder:text-white/40 outline-none focus:border-[#D95D39]"
        />
      </div>

      {q && (
        <p className="text-xs text-white/50 font-mono">{total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;</p>
      )}

      <div className="space-y-6">
        <Section icon={Building2} title="Agencies" count={results.agencies.length}>
          {results.agencies.map((a) => (
            <Result key={a.id} to={`/superadmin/agencies/${a.id}`} testId={`gs-agency-${a.id}`} title={a.name} sub={`${a.city} · ${a.plan}`} />
          ))}
        </Section>
        <Section icon={Users} title="Nurses" count={results.nurses.length}>
          {results.nurses.map((n) => (
            <Result key={n.id} to={`/superadmin/nurses/${n.id}`} testId={`gs-nurse-${n.id}`} title={n.name} sub={`${n.email} · ${n.zone}`} />
          ))}
        </Section>
        <Section icon={UserRound} title="Clients" count={results.clients.length}>
          {results.clients.map((c) => (
            <Result key={c.id} to={`/superadmin/clients/${c.id}`} testId={`gs-client-${c.id}`} title={c.fullName} sub={`${c.mrn} · ${c.conditions[0]}`} />
          ))}
        </Section>
        <Section icon={ScrollText} title="Audit events" count={results.audit.length}>
          {results.audit.map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-stone-900/60 p-4">
              <span className="font-mono text-xs text-white/40 w-12 shrink-0">{a.t}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate"><span className="font-semibold">{a.actorName}</span> · {a.action}</p>
                <p className="text-xs text-white/40 truncate">{a.resource}</p>
              </div>
            </div>
          ))}
        </Section>

        {q && total === 0 && (
          <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-8 text-center text-white/50">
            No results. Try a different keyword — MRN, IP address, or license number all work.
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, count, children }) {
  if (count === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 text-white/60 mb-3">
        <Icon className="h-4 w-4" /><p className="text-[10px] uppercase tracking-widest font-semibold">{title}</p>
        <span className="text-xs text-white/40 font-mono">· {count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Result({ to, title, sub, testId }) {
  return (
    <Link to={to} data-testid={testId} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-stone-900/60 hover:border-white/30 hover:bg-white/5 p-4 transition-colors">
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white truncate">{title}</p><p className="text-xs text-white/50 truncate">{sub}</p></div>
      <ArrowRight className="h-4 w-4 text-white/30" />
    </Link>
  );
}
