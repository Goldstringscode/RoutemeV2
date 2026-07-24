import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RouteMeProvider, useRouteMe } from "@/context/RouteMeContext";
import AppShell from "@/components/AppShell";
import AgencyShell from "@/components/AgencyShell";
import SuperAdminShell from "@/components/SuperAdminShell";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import RouteView from "@/pages/RouteView";
import Visits from "@/pages/Visits";
import RoutesPage from "@/pages/Routes";
import Notifications from "@/pages/Notifications";
import Schedule from "@/pages/Schedule";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import Profile from "@/pages/Profile";
import Pricing from "@/pages/Pricing";
import Signup from "@/pages/Signup";
import Payment from "@/pages/Payment";
import Welcome from "@/pages/Welcome";
import NotFound from "@/pages/NotFound";
import EmailPreview from "@/pages/EmailPreview";
import AgencyLogin from "@/pages/AgencyLogin";
import AgencyOverview from "@/pages/agency/Overview";
import AgencyNurses from "@/pages/agency/Nurses";
import AgencyActivity from "@/pages/agency/Activity";
import AgencyClientsDir from "@/pages/agency/ClientsDir";
import AgencyClientDetail from "@/pages/agency/AgencyClientDetail";
import AgencyCompliance from "@/pages/agency/Compliance";
import AgencyBilling from "@/pages/agency/Billing";
import NurseDetail from "@/pages/agency/NurseDetail";
import SuperAdminLogin from "@/pages/SuperAdminLogin";
import SuperAdminOverview from "@/pages/superadmin/Overview";
import SuperAdminAgencies from "@/pages/superadmin/Agencies";
import SuperAdminAgencyDetail from "@/pages/superadmin/AgencyDetail";
import SuperAdminNurses from "@/pages/superadmin/NursesGlobal";
import SuperAdminNurseDetail from "@/pages/superadmin/NurseGlobalDetail";
import SuperAdminClients from "@/pages/superadmin/ClientsGlobal";
import SuperAdminClientPHI from "@/pages/superadmin/ClientPHI";
import SuperAdminStaff from "@/pages/superadmin/AdminStaff";
import SuperAdminAudit from "@/pages/superadmin/AuditGlobal";
import SuperAdminSecurity from "@/pages/superadmin/Security";
import SuperAdminBilling from "@/pages/superadmin/BillingPlatform";
import SuperAdminSystem from "@/pages/superadmin/SystemHealth";

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

function AgencyProtected({ children }) {
  const { agencyAuthed } = useRouteMe();
  if (!agencyAuthed) return <Navigate to="/agency/login" replace />;
  return children;
}

function SuperAdminProtected({ children }) {
  const { superAdminAuthed } = useRouteMe();
  if (!superAdminAuthed) return <Navigate to="/superadmin/login" replace />;
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
            <Route path="/signup" element={<Signup />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/thank-you" element={<Welcome />} />
            <Route path="/emails" element={<EmailPreview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/agency/login" element={<AgencyLogin />} />
            <Route path="/superadmin/login" element={<SuperAdminLogin />} />

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
                            <Route path="visits" element={<Visits />} />
                            <Route path="routes" element={<RoutesPage />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
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
              <Route path="clients/:id" element={<AgencyClientDetail />} />
              <Route path="compliance" element={<AgencyCompliance />} />
              <Route path="billing" element={<AgencyBilling />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route
              path="/superadmin"
              element={
                <SuperAdminProtected>
                  <SuperAdminShell />
                </SuperAdminProtected>
              }
            >
              <Route index element={<Navigate to="/superadmin/overview" replace />} />
              <Route path="overview" element={<SuperAdminOverview />} />
              <Route path="agencies" element={<SuperAdminAgencies />} />
              <Route path="agencies/:id" element={<SuperAdminAgencyDetail />} />
              <Route path="nurses" element={<SuperAdminNurses />} />
              <Route path="nurses/:id" element={<SuperAdminNurseDetail />} />
              <Route path="clients" element={<SuperAdminClients />} />
              <Route path="clients/:id" element={<SuperAdminClientPHI />} />
              <Route path="staff" element={<SuperAdminStaff />} />
              <Route path="audit" element={<SuperAdminAudit />} />
              <Route path="security" element={<SuperAdminSecurity />} />
              <Route path="billing" element={<SuperAdminBilling />} />
              <Route path="system" element={<SuperAdminSystem />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RouteMeProvider>
    </div>
  );
}

export default App;