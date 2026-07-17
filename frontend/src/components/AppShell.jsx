import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Map, Users, Calendar, User, LogOut, Mic, Plus } from "lucide-react";
import HipaaBadge from "@/components/HipaaBadge";
import NoteModal from "@/components/VoiceNoteModal";
import { useRouteMe } from "@/context/RouteMeContext";
import { supabase } from "@/lib/supabase";

const NAV = [
  { to: "/app/dashboard", label: "Today", icon: Home, testId: "nav-dashboard" },
  { to: "/app/route", label: "Route", icon: Map, testId: "nav-route" },
  { to: "/app/schedule", label: "Schedule", icon: Calendar, testId: "nav-schedule" },
  { to: "/app/clients", label: "Clients", icon: Users, testId: "nav-clients" },
  { to: "/app/profile", label: "Profile", icon: User, testId: "nav-profile" },
];

export default function AppShell() {
  const { nurse, setAuthed, openVoice, schedule } = useRouteMe();
  const navigate = useNavigate();

  const logout = async () => {
      await supabase.auth.signOut();
      setAuthed(false);
      navigate("/login");
    };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-stone-200 bg-[#F9F8F6] px-5 py-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <Logo />
          <span className="font-display text-xl font-semibold">RouteMe</span>
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
                    ? "bg-white border border-stone-200 text-stone-900 shadow-sm"
                    : "text-stone-600 hover:bg-white/70 hover:text-stone-900"
                }`
              }
            >
              <n.icon className="h-4 w-4" strokeWidth={2} />
              {n.label}
              {n.to === "/app/route" && (
                <span className="ml-auto text-[10px] font-semibold rounded-full bg-[#F7E5DD] text-[#D95D39] px-2 py-0.5">
                  {schedule.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <img
              src={nurse.avatar}
              alt=""
              className="h-10 w-10 rounded-full object-cover border border-stone-200"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{nurse.name}</p>
              <p className="text-xs text-stone-500 truncate">{nurse.region}</p>
            </div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg py-1.5 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#F9F8F6]/85 backdrop-blur-md px-5 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <Logo />
            <span className="font-display text-lg font-semibold">RouteMe</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">
              {new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
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

        {/* Floating note FAB */}
        <button
          data-testid="note-fab"
          onClick={() => openVoice(schedule[0]?.id)}
          className="fixed bottom-6 right-6 z-40 group inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white pl-4 pr-5 py-3 shadow-lg shadow-[#D95D39]/30 transition-transform duration-300 hover:-translate-y-0.5"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <Plus className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold hidden sm:inline">New note</span>
        </button>

        <NoteModal />
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="relative h-8 w-8 rounded-xl bg-stone-900 flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#D95D39] border-2 border-[#F9F8F6]" />
    </div>
  );
}
