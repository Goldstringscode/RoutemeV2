import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RouteMeProvider, useRouteMe } from "@/context/RouteMeContext";
import AppShell from "@/components/AppShell";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import RouteView from "@/pages/RouteView";
import Schedule from "@/pages/Schedule";
import Clients from "@/pages/Clients";
import Profile from "@/pages/Profile";

function Protected({ children }) {
  const { authed, supabaseReady, dataReady, loadingError } = useRouteMe();

  // Still checking auth
  if (!supabaseReady) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-[#D95D39] border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-sm text-stone-500">Connecting...</p>
        </div>
      </div>
    );
  }

  // Not signed in — redirect to login
  if (!authed) return <Navigate to="/login" replace />;

  // Signed in but data still loading
  if (!dataReady) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-[#D95D39] border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-sm text-stone-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Data loaded with errors — show warning but still render
  if (loadingError) {
    console.warn('RouteMe: Data loaded with errors:', loadingError);
  }

  return children;
}

function App() {
  return (
    <div className="App">
      <RouteMeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/app"
              element={
                <Protected>
                  <AppShell />
                </Protected>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="route" element={<RouteView />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="clients" element={<Clients />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </RouteMeProvider>
    </div>
  );
}

export default App;
