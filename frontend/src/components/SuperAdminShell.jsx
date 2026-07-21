import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserRound,
  Shield,
  ScrollText,
  CreditCard,
  Cpu,
  UserCog,
  LogOut,
  Search,
  Radio,
  ChevronDown,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

const NAV = [
  { to: "/superadmin/overview", label: "Overview", icon: LayoutDashboard, testId: "sa-nav-overview" },
  { to: "/superadmin/agencies", label: "Agencies", icon: Building2, testId: "sa-nav-agencies" },
  { to: "/superadmin/nurses", label: "Nurses", icon: Users, testId: "sa-nav-nurses" },
  { to: "/superadmin/clients", label: "Clients · PHI", icon: UserRound, testId: "sa-nav-clients" },
  { to: "/superadmin/staff", label: "Admin staff", icon: UserCog, testId: "sa-nav-staff" },
  { to: "/superadmin/audit", label: "HIPAA audit", icon: ScrollText, testId: "sa-nav-audit" },
  { to: "/superadmin/security", label: "Security", icon: Shield, testId: "sa-nav-security" },
  { to: "/superadmin/billing", label: "Billing", icon: CreditCard, testId: "sa-nav-billing" },
  { to: "/superadmin/system", label: "System", icon: Cpu, testId: "sa-nav-system" },
];

export default function SuperAdminShell() {
  const {
    setSuperAdminAuthed,
    superAdminMe,
    platform,
    maintenanceMode,
    impersonation,
    stopImpersonation,
  } = useRouteMe();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    setSuperAdminAuthed(false);
    navigate("/superadmin/login");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex rm-grain">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/10 bg-stone-900/70 backdrop-blur-md px-5 py-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-[#D95D39] to-[#8a3a24] flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#F7E5DD] border-2 border-stone-900" />
          </div>
          <div>
            <div className="font-display text-base leading-tight text-white">RouteMe</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#D95D39] font-semibold">
              Platform · Root
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-white/10 bg-black/30 px-3 py-2 flex items-center gap-2 text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="uppercase tracking-widest text-white/60 font-semibold">{platform.env}</span>
          <span className="text-white/30 ml-auto">{platform.version}</span>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={n.testId}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <n.icon className="h-4 w-4" strokeWidth={2} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D95D39] to-[#8a3a24] text-white font-semibold flex items-center justify-center">
              {superAdminMe.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-white">{superAdminMe.name}</p>
              <p className="text-xs text-[#D95D39] truncate">{superAdminMe.role}</p>
            </div>
          </div>
          <button
            data-testid="sa-logout-btn"
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-lg py-1.5 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile hamburger drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMobile} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-stone-900 border-r border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-[#D95D39] to-[#8a3a24] flex items-center justify-center shadow-inner">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="font-display text-base leading-tight text-white">RouteMe</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[#D95D39] font-semibold">Platform · Root</div>
                </div>
              </div>
              <button onClick={closeMobile} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors">
                <X className="h-5 w-5 text-white/60" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-[10px] text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="uppercase tracking-widest font-semibold">{platform.env}</span>
                <span className="ml-auto">{platform.version}</span>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV.map((n) => {
                const Icon = n.icon;
                const isActive = location.pathname.startsWith(n.to);
                return (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    onClick={closeMobile}
                    data-testid={`m-${n.testId}`}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/10 text-white border border-white/10"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-[#D95D39] text-white" : "bg-white/10 text-white/50"
                    }`}>
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="flex-1">{n.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="px-4 py-5 border-t border-white/10">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D95D39] to-[#8a3a24] text-white font-semibold flex items-center justify-center">
                    {superAdminMe.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-white">{superAdminMe.name}</p>
                    <p className="text-xs text-[#D95D39] truncate">{superAdminMe.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); closeMobile(); }}
                  className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-lg py-2 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {impersonation && (
          <div
            data-testid="sa-impersonation-banner"
            className="bg-[#D95D39] text-white px-4 py-2 text-xs font-semibold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Radio className="h-3.5 w-3.5" /> Impersonating {impersonation.name} · {impersonation.role}. All actions are logged.
            </span>
            <button
              onClick={stopImpersonation}
              data-testid="sa-stop-impersonation"
              className="rounded-full bg-white/15 hover:bg-white/25 px-3 py-1 text-[11px] uppercase tracking-widest"
            >
              End session
            </button>
          </div>
        )}

        {maintenanceMode && (
          <div className="bg-amber-500 text-stone-900 px-4 py-2 text-xs font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-stone-900 animate-pulse" />
            MAINTENANCE MODE · platform read-only for all agencies
          </div>
        )}

        <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/80 backdrop-blur-md px-5 md:px-8 py-3 flex items-center justify-between">
          <div className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/50 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D95D39]" /> {platform.name} · {platform.region} · build {platform.build}
          </div>
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5 text-white/70" />
            </button>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#D95D39] to-[#8a3a24] flex items-center justify-center text-white text-xs font-semibold">
              R
            </div>
            <span className="font-display text-lg font-semibold text-white">Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-white/40" />
              <input
                placeholder="Search agencies, nurses, clients, audit…"
                className="bg-transparent text-xs outline-none w-64 text-white placeholder:text-white/30"
                data-testid="sa-search"
              />
              <span className="text-[10px] text-white/40 border border-white/10 rounded px-1">⌘K</span>
            </div>
            <button className="relative h-8 w-8 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center">
              <Bell className="h-4 w-4 text-white/70" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#D95D39]" />
            </button>
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[10px] uppercase tracking-widest text-emerald-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> All systems normal
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 md:px-8 py-6 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}