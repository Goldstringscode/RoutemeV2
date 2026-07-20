import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RouteMeProvider, useRouteMe } from "@/context/RouteMeContext";
import AppShell from "@/components/AppShell";
import AgencyShell from "@/components/AgencyShell";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import RouteView from "@/pages/RouteView";
import Schedule from "@/pages/Schedule";
import Clients from "@/pages/Clients";
import Profile from "@/pages/Profile";
import ClientDetail from "@/pages/ClientDetail";
import Pricing from "@/pages/Pricing";
import AgencyLogin from "@/pages/AgencyLogin";
import AgencyOverview from "@/pages/agency/Overview";
import AgencyNurses from "@/pages/agency/Nurses";
import AgencyActivity from "@/pages/agency/Activity";
import AgencyClientsDir from "@/pages/agency/ClientsDir";
import AgencyCompliance from "@/pages/agency/Compliance";
import AgencyBilling from "@/pages/agency/Billing";
import NurseDetail from "@/pages/agency/NurseDetail";

function Protected({ children }) {
  const { authed } = useRouteMe();
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

function AgencyProtected({ children }) {
  const { agencyAuthed } = useRouteMe();
  if (!agencyAuthed) return <Navigate to="/agency/login" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <RouteMeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/agency/login" element={<AgencyLogin />} />

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
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route
              path="/agency"
              element={
                <AgencyProtected>
                  <AgencyShell />
                </AgencyProtected>
              }
            >
              <Route index element={<Navigate to="/agency/overview" replace />} />
              <Route path="overview" element={<AgencyOverview />} />
              <Route path="nurses" element={<AgencyNurses />} />
              <Route path="nurses/:id" element={<NurseDetail />} />
              <Route path="activity" element={<AgencyActivity />} />
              <Route path="clients" element={<AgencyClientsDir />} />
              <Route path="compliance" element={<AgencyCompliance />} />
              <Route path="billing" element={<AgencyBilling />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </RouteMeProvider>
    </div>
  );
}

export default App;
