import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Activity,
  UserRound,
  ShieldCheck,
  CreditCard,
  LogOut,
  Search,
} from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import HipaaBadge from "@/components/HipaaBadge";

const NAV = [
  { to: "/agency/overview", label: "Overview", icon: LayoutDashboard, testId: "agency-nav-overview" },
  { to: "/agency/nurses", label: "Nurses", icon: Users, testId: "agency-nav-nurses" },
  { to: "/agency/activity", label: "Live activity", icon: Activity, testId: "agency-nav-activity" },
  { to: "/agency/clients", label: "Clients", icon: UserRound, testId: "agency-nav-clients" },
  { to: "/agency/compliance", label: "Compliance", icon: ShieldCheck, testId: "agency-nav-compliance" },
  { to: "/agency/billing", label: "Billing", icon: CreditCard, testId: "agency-nav-billing" },
];

export default function AgencyShell() {
  const { agency, setAgencyAuthed, nurses } = useRouteMe();
  const navigate = useNavigate();

  const logout = () => {
    setAgencyAuthed(false);
    navigate("/agency/login");
  };

  const activeNurses = nurses.filter((n) => n.status === "active").length;

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-stone-200 bg-white px-5 py-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-stone-900 text-white font-display font-semibold flex items-center justify-center">
            {agency.logo}
          </div>
          <div>
            <div className="font-display text-base leading-tight">{agency.name}</div>
            <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
              Agency console
            </div>
          </div>
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
                    ? "bg-[#F7E5DD] text-[#D95D39] border border-[#F0D2C4]"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`
              }
            >
              <n.icon className="h-4 w-4" strokeWidth={2} />
              {n.label}
              {n.to === "/agency/nurses" && (
                <span className="ml-auto text-[10px] font-semibold rounded-full bg-stone-100 text-stone-700 px-2 py-0.5">
                  {activeNurses}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-[#F9F8F6] p-4">
          <div className="flex items-center gap-3">
            <img
              src={agency.admin.avatar}
              alt=""
              className="h-10 w-10 rounded-full object-cover border border-stone-200"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{agency.admin.name}</p>
              <p className="text-xs text-stone-500 truncate">{agency.admin.title}</p>
            </div>
          </div>
          <button
            data-testid="agency-logout-btn"
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg py-1.5 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#F9F8F6]/85 backdrop-blur-md px-5 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-stone-900 text-white font-display font-semibold flex items-center justify-center text-sm">
              {agency.logo}
            </div>
            <span className="font-display text-lg font-semibold">{agency.name}</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D95D39]" /> {agency.plan} plan · seats {agency.seatsUsed}/{agency.seatsTotal}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-stone-400" />
              <input
                placeholder="Search nurses, clients…"
                className="bg-transparent text-xs outline-none w-40"
                data-testid="agency-search"
              />
              <span className="text-[10px] text-stone-400 border border-stone-200 rounded px-1">⌘K</span>
            </div>
            <HipaaBadge />
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="lg:hidden sticky top-[57px] z-20 border-b border-stone-200 bg-[#F9F8F6]/85 backdrop-blur px-2 py-2 flex overflow-x-auto gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`m-${n.testId}`}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold border ${
                  isActive
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-200"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-5 md:px-8 py-6 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
