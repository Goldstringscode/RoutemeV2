import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Map, Users, Calendar, User, LogOut, Bookmark, Stethoscope, Plus, Menu, X, Bell, ClipboardCheck } from "lucide-react";
import HipaaBadge from "@/components/HipaaBadge";
import NoteModal from "@/components/VoiceNoteModal";
import NewActionModal from "@/components/NewActionModal";
import ToastNotification from "@/components/ToastNotification";
import { useRouteMe } from "@/context/RouteMeContext";
import { supabase } from "@/lib/supabase";

const NAV = [
  { to: "/app/dashboard", label: "Today", icon: Home, testId: "nav-dashboard" },
  { to: "/app/route", label: "Route", icon: Map, testId: "nav-route" },
  { to: "/app/visits", label: "Visits", icon: ClipboardCheck, testId: "nav-visits" },
  { to: "/app/routes", label: "Saved Routes", icon: Bookmark, testId: "nav-routes" },
  { to: "/app/notifications", label: "Notifications", icon: Bell, testId: "nav-notifications" },
  { to: "/app/schedule", label: "Schedule", icon: Calendar, testId: "nav-schedule" },
  { to: "/app/clients", label: "Clients", icon: Users, testId: "nav-clients" },
  { to: "/app/profile", label: "Profile", icon: User, testId: "nav-profile" },
];

export default function AppShell() {
  const { nurse, setAuthed, schedule, agency, unreadNotifications, notifications, dismissNotification, markAllNotificationsRead } = useRouteMe();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [newActionOpen, setNewActionOpen] = useState(false);

  const latestToast = notifications.filter(n => n.t === "just now" && !n.read)[0] || null;
  const routeNotifsUnread = notifications.filter(n => n.type === "route" && !n.read).length;

  // Mark route notifications as read when navigating to /app/routes
  React.useEffect(() => {
    if (location.pathname === "/app/routes" && routeNotifsUnread > 0) {
      markAllNotificationsRead();
    }
  }, [location.pathname, routeNotifsUnread, markAllNotificationsRead]);

  const logout = async () => {
      await supabase.auth.signOut();
      setAuthed(false);
      navigate("/login");
    };

  const closeMobile = () => setMobileOpen(false);

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
                            {n.to === "/app/routes" && routeNotifsUnread > 0 && (
                              <span className="ml-auto text-[10px] font-semibold rounded-full bg-[#D95D39] text-white px-1.5 py-0.5 min-w-[18px] text-center">
                                {routeNotifsUnread > 9 ? "9+" : routeNotifsUnread}
                              </span>
                            )}
                            {n.to === "/app/notifications" && unreadNotifications > 0 && (
                              <span className="ml-auto text-[10px] font-semibold rounded-full bg-[#D95D39] text-white px-1.5 py-0.5 min-w-[18px] text-center">
                                {unreadNotifications > 9 ? "9+" : unreadNotifications}
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
            <button
              onClick={() => setMobileOpen(true)}
              data-testid="hamburger-btn"
              className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-stone-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5 text-stone-700" />
            </button>
            <Logo />
            <span className="font-display text-lg font-semibold">RouteMe</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-2.5 py-1">
                <span className="h-5 w-5 rounded-md bg-stone-900 text-white font-display font-semibold flex items-center justify-center text-[10px]">
                  {agency.logo}
                </span>
                <span className="normal-case tracking-normal text-stone-700 font-semibold">{agency.name}</span>
              </span>
              <span className="text-stone-300">·</span>
              {new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <HipaaBadge />
          </div>
        </header>

        {/* Mobile hamburger drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={closeMobile}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[#F9F8F6] border-r border-stone-200 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Logo />
                  <span className="font-display text-xl font-semibold">RouteMe</span>
                </div>
                <button
                  onClick={closeMobile}
                  data-testid="close-hamburger-btn"
                  className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-stone-100 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5 text-stone-500" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV.map((n) => {
                  const Icon = n.icon;
                  return (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      onClick={closeMobile}
                      data-testid={`m-${n.testId}`}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-white border border-stone-200 text-stone-900 shadow-sm"
                            : "text-stone-600 hover:bg-white/70 hover:text-stone-900"
                        }`
                      }
                    >
                      <span className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                        location.pathname.startsWith(n.to)
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-500"
                      }`}>
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <span className="flex-1">{n.label}</span>
                      {n.to === "/app/route" && (
                                              <span className="text-[10px] font-semibold rounded-full bg-[#F7E5DD] text-[#D95D39] px-2 py-0.5">
                                                {schedule.length}
                                              </span>
                                            )}
                                            {n.to === "/app/routes" && routeNotifsUnread > 0 && (
                                              <span className="text-[10px] font-semibold rounded-full bg-[#D95D39] text-white px-1.5 py-0.5">
                                                {routeNotifsUnread}
                                              </span>
                                            )}
                                            {n.to === "/app/notifications" && unreadNotifications > 0 && (
                        <span className="text-[10px] font-semibold rounded-full bg-[#D95D39] text-white px-1.5 py-0.5">
                          {unreadNotifications}
                        </span>
                      )}
                      {location.pathname.startsWith(n.to) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D95D39]" />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
              <div className="px-4 py-5 border-t border-stone-200">
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
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
                    data-testid="m-logout-btn"
                    onClick={() => { logout(); closeMobile(); }}
                    className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg py-2 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 px-5 md:px-8 py-6 md:py-10">
          <Outlet />
        </main>

        {/* Floating "New" FAB */}
        <button
          data-testid="new-action-fab"
          onClick={() => setNewActionOpen(true)}
          className="fixed bottom-6 right-6 z-40 group inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white pl-4 pr-5 py-3 shadow-lg shadow-[#D95D39]/30 transition-transform duration-300 hover:-translate-y-0.5"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <Plus className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold hidden sm:inline">New</span>
        </button>

        {/* Toast notification */}
        <ToastNotification notification={latestToast} onDismiss={dismissNotification} />

        {/* Modals */}
        <NoteModal />
        <NewActionModal open={newActionOpen} onClose={() => setNewActionOpen(false)} />
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