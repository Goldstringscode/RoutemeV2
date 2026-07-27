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
import Schedule from "@/pages/Schedule";
import Clients from "@/pages/Clients";
import Profile from "@/pages/Profile";
import ClientDetail from "@/pages/ClientDetail";
import ClientForm from "@/pages/ClientForm";
import Pricing from "@/pages/Pricing";
import Signup from "@/pages/Signup";
import Payment from "@/pages/Payment";
import Welcome from "@/pages/Welcome";
import NotFound from "@/pages/NotFound";
import EmailPreview from "@/pages/EmailPreview";
import Contact from "@/pages/Contact";
import HelpCenter from "@/pages/HelpCenter";
import Notifications from "@/pages/Notifications";
import NurseSettings from "@/pages/NurseSettings";
import TimeMileage from "@/pages/TimeMileage";
import VisitSignature from "@/pages/VisitSignature";
import CarePlan from "@/pages/CarePlan";
import VitalsEntry from "@/pages/VitalsEntry";
import Onboarding from "@/pages/Onboarding";
import SOAPHub from "@/pages/SOAPHub";
import SOAPEditorPage from "@/pages/SOAPEditorPage";
import Terms from "@/pages/legal/Terms";
import Privacy from "@/pages/legal/Privacy";
import BAA from "@/pages/legal/BAA";
import Cookies from "@/pages/legal/Cookies";
import SecurityPage from "@/pages/legal/SecurityPage";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import SetNewPassword from "@/pages/auth/SetNewPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import MFASetup from "@/pages/auth/MFASetup";
import DataPrivacy from "@/pages/auth/DataPrivacy";
import AgencyLogin from "@/pages/AgencyLogin";
import AgencyOverview from "@/pages/agency/Overview";
import AgencyNurses from "@/pages/agency/Nurses";
import AgencyActivity from "@/pages/agency/Activity";
import AgencyClientsDir from "@/pages/agency/ClientsDir";
import AgencyCompliance from "@/pages/agency/Compliance";
import AgencyBilling from "@/pages/agency/Billing";
import NurseDetail from "@/pages/agency/NurseDetail";
import AgencySettings from "@/pages/agency/Settings";
import Team from "@/pages/agency/Team";
import Dispatch from "@/pages/agency/Dispatch";
import Reports from "@/pages/agency/Reports";
import ClientIntake from "@/pages/agency/ClientIntake";
import Payroll from "@/pages/agency/Payroll";
import Invoicing from "@/pages/agency/Invoicing";
import AgencyOnboarding from "@/pages/agency/AgencyOnboarding";
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
import GlobalSearch from "@/pages/superadmin/GlobalSearch";
import DataRetention from "@/pages/superadmin/DataRetention";

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
            {/* Public / marketing */}
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/emails" element={<EmailPreview />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/welcome" element={<Welcome />} />

            {/* Legal */}
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/legal/baa" element={<BAA />} />
            <Route path="/legal/cookies" element={<Cookies />} />
            <Route path="/legal/security" element={<SecurityPage />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/agency/login" element={<AgencyLogin />} />
            <Route path="/superadmin/login" element={<SuperAdminLogin />} />
            <Route path="/auth/forgot" element={<ForgotPassword />} />
            <Route path="/auth/set-password" element={<SetNewPassword />} />
            <Route path="/auth/verify" element={<VerifyEmail />} />
            <Route path="/auth/mfa" element={<MFASetup />} />
            <Route path="/settings/data" element={<DataPrivacy />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/agency/onboarding" element={<AgencyOnboarding />} />

            {/* Nurse portal */}
            <Route path="/app" element={<Protected><AppShell /></Protected>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="route" element={<RouteView />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/new" element={<ClientForm />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="clients/:id/edit" element={<ClientForm />} />
              <Route path="clients/:id/care-plan" element={<CarePlan />} />
              <Route path="clients/:id/vitals" element={<VitalsEntry />} />
              <Route path="clients/:id/signature" element={<VisitSignature />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="soap" element={<SOAPHub />} />
              <Route path="soap/new" element={<SOAPEditorPage />} />
              <Route path="soap/:id" element={<SOAPEditorPage />} />
              <Route path="settings" element={<NurseSettings />} />
              <Route path="time" element={<TimeMileage />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Agency console */}
            <Route path="/agency" element={<AgencyProtected><AgencyShell /></AgencyProtected>}>
              <Route index element={<Navigate to="/agency/overview" replace />} />
              <Route path="overview" element={<AgencyOverview />} />
              <Route path="nurses" element={<AgencyNurses />} />
              <Route path="nurses/:id" element={<NurseDetail />} />
              <Route path="activity" element={<AgencyActivity />} />
              <Route path="clients" element={<AgencyClientsDir />} />
              <Route path="clients/intake" element={<ClientIntake />} />
              <Route path="dispatch" element={<Dispatch />} />
              <Route path="reports" element={<Reports />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="invoicing" element={<Invoicing />} />
              <Route path="team" element={<Team />} />
              <Route path="settings" element={<AgencySettings />} />
              <Route path="compliance" element={<AgencyCompliance />} />
              <Route path="billing" element={<AgencyBilling />} />
            </Route>

            {/* Super admin console */}
            <Route path="/superadmin" element={<SuperAdminProtected><SuperAdminShell /></SuperAdminProtected>}>
              <Route index element={<Navigate to="/superadmin/overview" replace />} />
              <Route path="overview" element={<SuperAdminOverview />} />
              <Route path="search" element={<GlobalSearch />} />
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
              <Route path="retention" element={<DataRetention />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RouteMeProvider>
    </div>
  );
}

export default App;
