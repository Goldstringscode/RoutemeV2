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
  const { authed } = useRouteMe();
  if (!authed) return <Navigate to="/login" replace />;
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
