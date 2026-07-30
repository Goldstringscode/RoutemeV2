import React, { Suspense } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RouteMeProvider } from "@/context";
import { useRouteMe } from "@/context/RouteMeContext";
import AppShell from "@/components/AppShell";
import AgencyShell from "@/components/AgencyShell";
import SuperAdminShell from "@/components/SuperAdminShell";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";

// Lazy-loaded page chunks — split into 4 groups for optimal loading
// Public (loaded first, always needed)
const Landing = React.lazy(() => import("@/pages/Landing"));
const Login = React.lazy(() => import("@/pages/Login"));
const AgencyLogin = React.lazy(() => import("@/pages/AgencyLogin"));
const SuperAdminLogin = React.lazy(() => import("@/pages/SuperAdminLogin"));
const Pricing = React.lazy(() => import("@/pages/Pricing"));
const Signup = React.lazy(() => import("@/pages/Signup"));
const Payment = React.lazy(() => import("@/pages/Payment"));
const Welcome = React.lazy(() => import("@/pages/Welcome"));
const ForgotPassword = React.lazy(() => import("@/pages/auth/ForgotPassword"));
const SetNewPassword = React.lazy(() => import("@/pages/auth/SetNewPassword"));
const VerifyEmail = React.lazy(() => import("@/pages/auth/VerifyEmail"));
const DataPrivacy = React.lazy(() => import("@/pages/auth/DataPrivacy"));
const BAA = React.lazy(() => import("@/pages/legal/BAA"));
const Privacy = React.lazy(() => import("@/pages/legal/Privacy"));
const Terms = React.lazy(() => import("@/pages/legal/Terms"));
const SecurityPage = React.lazy(() => import("@/pages/legal/SecurityPage"));
const Cookies = React.lazy(() => import("@/pages/legal/Cookies"));
const Success = React.lazy(() => import("@/pages/Success"));
const Cancel = React.lazy(() => import("@/pages/Cancel"));
const Onboarding = React.lazy(() => import("@/pages/Onboarding"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const EmailPreview = React.lazy(() => import("@/pages/EmailPreview"));

// Nurse app (loaded when user navigates to /app/*)
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const RouteView = React.lazy(() => import("@/pages/RouteView"));
const Visits = React.lazy(() => import("@/pages/Visits"));
const RoutesPage = React.lazy(() => import("@/pages/Routes"));
const Notifications = React.lazy(() => import("@/pages/Notifications"));
const Schedule = React.lazy(() => import("@/pages/Schedule"));
const Clients = React.lazy(() => import("@/pages/Clients"));
const ClientDetail = React.lazy(() => import("@/pages/ClientDetail"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const SOAPHub = React.lazy(() => import("@/pages/SOAPHub"));
const SOAPEditorPage = React.lazy(() => import("@/pages/SOAPEditorPage"));
const ClientForm = React.lazy(() => import("@/pages/ClientForm"));
const CarePlan = React.lazy(() => import("@/pages/CarePlan"));
const VitalsEntry = React.lazy(() => import("@/pages/VitalsEntry"));
const VisitSignature = React.lazy(() => import("@/pages/VisitSignature"));
const HelpCenter = React.lazy(() => import("@/pages/HelpCenter"));
const NurseSettings = React.lazy(() => import("@/pages/NurseSettings"));

// Agency console (loaded when user navigates to /agency/*)
const AgencyOverview = React.lazy(() => import("@/pages/agency/Overview"));
const AgencyNurses = React.lazy(() => import("@/pages/agency/Nurses"));
const AgencyActivity = React.lazy(() => import("@/pages/agency/Activity"));
const AgencyClientsDir = React.lazy(() => import("@/pages/agency/ClientsDir"));
const AgencyClientDetail = React.lazy(() => import("@/pages/agency/AgencyClientDetail"));
const AgencyCompliance = React.lazy(() => import("@/pages/agency/Compliance"));
const AgencyBilling = React.lazy(() => import("@/pages/agency/Billing"));
const EvvSettings = React.lazy(() => import("@/pages/agency/EvvSettings"));
const NurseDetail = React.lazy(() => import("@/pages/agency/NurseDetail"));

// Super admin (loaded when user navigates to /superadmin/*)
const SuperAdminOverview = React.lazy(() => import("@/pages/superadmin/Overview"));
const SuperAdminAgencies = React.lazy(() => import("@/pages/superadmin/Agencies"));
const SuperAdminAgencyDetail = React.lazy(() => import("@/pages/superadmin/AgencyDetail"));
const SuperAdminNurses = React.lazy(() => import("@/pages/superadmin/NursesGlobal"));
const SuperAdminNurseDetail = React.lazy(() => import("@/pages/superadmin/NurseGlobalDetail"));
const SuperAdminClients = React.lazy(() => import("@/pages/superadmin/ClientsGlobal"));
const SuperAdminClientPHI = React.lazy(() => import("@/pages/superadmin/ClientPHI"));
const SuperAdminStaff = React.lazy(() => import("@/pages/superadmin/AdminStaff"));
const SuperAdminAudit = React.lazy(() => import("@/pages/superadmin/AuditGlobal"));
const SuperAdminSecurity = React.lazy(() => import("@/pages/superadmin/Security"));
const SuperAdminBilling = React.lazy(() => import("@/pages/superadmin/BillingPlatform"));
const SuperAdminSystem = React.lazy(() => import("@/pages/superadmin/SystemHealth"));
const SuperAdminDataRetention = React.lazy(() => import("@/pages/superadmin/DataRetention"));
const SuperAdminGlobalSearch = React.lazy(() => import("@/pages/superadmin/GlobalSearch"));

// Shared loading fallback for Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
    <div className="text-center">
      <div className="h-10 w-10 rounded-full border-2 border-[#D95D39] border-t-transparent animate-spin mx-auto" />
      <p className="mt-4 text-sm text-stone-500">Loading...</p>
    </div>
  </div>
);

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
                    <Toaster />
                    <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Suspense fallback={<PageLoader />}><Landing /></Suspense>} />
                  <Route path="/pricing" element={<Suspense fallback={<PageLoader />}><Pricing /></Suspense>} />
                  <Route path="/signup" element={<Suspense fallback={<PageLoader />}><Signup /></Suspense>} />
                  <Route path="/payment" element={<Suspense fallback={<PageLoader />}><Payment /></Suspense>} />
                  <Route path="/welcome" element={<Suspense fallback={<PageLoader />}><Welcome /></Suspense>} />
                  <Route path="/thank-you" element={<Suspense fallback={<PageLoader />}><Welcome /></Suspense>} />
                  {process.env.NODE_ENV === 'development' && (
                    <Route path="/emails" element={<Suspense fallback={<PageLoader />}><EmailPreview /></Suspense>} />
                  )}
                  <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
                  <Route path="/agency/login" element={<Suspense fallback={<PageLoader />}><AgencyLogin /></Suspense>} />
                  <Route path="/superadmin/login" element={<Suspense fallback={<PageLoader />}><SuperAdminLogin /></Suspense>} />
                  <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense>} />
                  <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><SetNewPassword /></Suspense>} />
                  <Route path="/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmail /></Suspense>} />
                  <Route path="/data-privacy" element={<Suspense fallback={<PageLoader />}><DataPrivacy /></Suspense>} />
                  <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}><Onboarding /></Suspense>} />
                  <Route path="/legal/baa" element={<Suspense fallback={<PageLoader />}><BAA /></Suspense>} />
                  <Route path="/legal/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
                  <Route path="/legal/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
                  <Route path="/legal/security" element={<Suspense fallback={<PageLoader />}><SecurityPage /></Suspense>} />
                                    <Route path="/legal/cookies" element={<Suspense fallback={<PageLoader />}><Cookies /></Suspense>} />
                                    <Route path="/success" element={<Suspense fallback={<PageLoader />}><Success /></Suspense>} />
                                    <Route path="/cancel" element={<Suspense fallback={<PageLoader />}><Cancel /></Suspense>} />

                  <Route
                                path="/app"
                                element={
                                  <ErrorBoundary fallbackMessage="The nurse workspace encountered an error.">
                                    <Protected>
                                      <AppShell />
                                    </Protected>
                                  </ErrorBoundary>
                                }
                  >
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                    <Route path="route" element={<Suspense fallback={<PageLoader />}><RouteView /></Suspense>} />
                                  <Route path="visits" element={<Suspense fallback={<PageLoader />}><Visits /></Suspense>} />
                                  <Route path="routes" element={<Suspense fallback={<PageLoader />}><RoutesPage /></Suspense>} />
                    <Route path="notifications" element={<Suspense fallback={<PageLoader />}><Notifications /></Suspense>} />
                    <Route path="schedule" element={<Suspense fallback={<PageLoader />}><Schedule /></Suspense>} />
                    <Route path="clients" element={<Suspense fallback={<PageLoader />}><Clients /></Suspense>} />
                    <Route path="clients/:id" element={<Suspense fallback={<PageLoader />}><ClientDetail /></Suspense>} />
                    <Route path="profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
                    <Route path="soap" element={<Suspense fallback={<PageLoader />}><SOAPHub /></Suspense>} />
                    <Route path="soap/new" element={<Suspense fallback={<PageLoader />}><SOAPEditorPage /></Suspense>} />
                                  <Route path="soap/new/:clientId" element={<Suspense fallback={<PageLoader />}><SOAPEditorPage /></Suspense>} />
                    <Route path="soap/:id" element={<Suspense fallback={<PageLoader />}><SOAPEditorPage /></Suspense>} />
                                  <Route path="clients/new" element={<Suspense fallback={<PageLoader />}><ClientForm /></Suspense>} />
                                  <Route path="clients/:id/edit" element={<Suspense fallback={<PageLoader />}><ClientForm /></Suspense>} />
                                  <Route path="clients/:id/care-plan" element={<Suspense fallback={<PageLoader />}><CarePlan /></Suspense>} />
                                  <Route path="clients/:id/vitals" element={<Suspense fallback={<PageLoader />}><VitalsEntry /></Suspense>} />
                                  <Route path="clients/:id/sign" element={<Suspense fallback={<PageLoader />}><VisitSignature /></Suspense>} />
                                  <Route path="help" element={<Suspense fallback={<PageLoader />}><HelpCenter /></Suspense>} />
                                  <Route path="settings" element={<Suspense fallback={<PageLoader />}><NurseSettings /></Suspense>} />
                                  <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                  </Route>

                  <Route
                                path="/agency"
                                element={
                                  <ErrorBoundary fallbackMessage="The agency console encountered an error.">
                                    <AgencyProtected>
                                      <AgencyShell />
                                    </AgencyProtected>
                                  </ErrorBoundary>
                                }
                  >
                    <Route index element={<Navigate to="/agency/overview" replace />} />
                    <Route path="overview" element={<Suspense fallback={<PageLoader />}><AgencyOverview /></Suspense>} />
                    <Route path="nurses" element={<Suspense fallback={<PageLoader />}><AgencyNurses /></Suspense>} />
                    <Route path="nurses/:id" element={<Suspense fallback={<PageLoader />}><NurseDetail /></Suspense>} />
                    <Route path="activity" element={<Suspense fallback={<PageLoader />}><AgencyActivity /></Suspense>} />
                    <Route path="clients" element={<Suspense fallback={<PageLoader />}><AgencyClientsDir /></Suspense>} />
                    <Route path="clients/:id" element={<Suspense fallback={<PageLoader />}><AgencyClientDetail /></Suspense>} />
                    <Route path="compliance" element={<Suspense fallback={<PageLoader />}><AgencyCompliance /></Suspense>} />
                    <Route path="billing" element={<Suspense fallback={<PageLoader />}><AgencyBilling /></Suspense>} />
                    <Route path="evv" element={<Suspense fallback={<PageLoader />}><EvvSettings /></Suspense>} />
                    <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                  </Route>

                  <Route
                                path="/superadmin"
                                element={
                                  <ErrorBoundary fallbackMessage="The superadmin console encountered an error.">
                                    <SuperAdminProtected>
                                      <SuperAdminShell />
                                    </SuperAdminProtected>
                                  </ErrorBoundary>
                                }
                  >
                    <Route index element={<Navigate to="/superadmin/overview" replace />} />
                    <Route path="overview" element={<Suspense fallback={<PageLoader />}><SuperAdminOverview /></Suspense>} />
                    <Route path="agencies" element={<Suspense fallback={<PageLoader />}><SuperAdminAgencies /></Suspense>} />
                    <Route path="agencies/:id" element={<Suspense fallback={<PageLoader />}><SuperAdminAgencyDetail /></Suspense>} />
                    <Route path="nurses" element={<Suspense fallback={<PageLoader />}><SuperAdminNurses /></Suspense>} />
                    <Route path="nurses/:id" element={<Suspense fallback={<PageLoader />}><SuperAdminNurseDetail /></Suspense>} />
                    <Route path="clients" element={<Suspense fallback={<PageLoader />}><SuperAdminClients /></Suspense>} />
                    <Route path="clients/:id" element={<Suspense fallback={<PageLoader />}><SuperAdminClientPHI /></Suspense>} />
                    <Route path="staff" element={<Suspense fallback={<PageLoader />}><SuperAdminStaff /></Suspense>} />
                    <Route path="audit" element={<Suspense fallback={<PageLoader />}><SuperAdminAudit /></Suspense>} />
                    <Route path="security" element={<Suspense fallback={<PageLoader />}><SuperAdminSecurity /></Suspense>} />
                    <Route path="billing" element={<Suspense fallback={<PageLoader />}><SuperAdminBilling /></Suspense>} />
                    <Route path="system" element={<Suspense fallback={<PageLoader />}><SuperAdminSystem /></Suspense>} />
                                  <Route path="data-retention" element={<Suspense fallback={<PageLoader />}><SuperAdminDataRetention /></Suspense>} />
                                  <Route path="global-search" element={<Suspense fallback={<PageLoader />}><SuperAdminGlobalSearch /></Suspense>} />
                                  <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                  </Route>

                  <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                </Routes>
              </BrowserRouter>
            </RouteMeProvider>
          </div>
        );
      }

      export default App;