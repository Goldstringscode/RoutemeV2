/**
 * RouteMeContext — backwards-compatible compatibility layer.
 *
 * Phase 7: this file no longer owns its own Provider or context value.
 * It simply re-exports the composed RouteMeProvider from index.js
 * and provides useRouteMe() which merges all 6 domain contexts.
 *
 * Consumers can continue using useRouteMe() without changes.
 * Over time, migrate each consumer to the specific context hook it needs.
 */
import { useAuth } from "./AuthContext";
import { useNurse } from "./NurseContext";
import { useRoute } from "./RouteContext";
import { useSOAP } from "./SOAPContext";
import { useAgency } from "./AgencyContext";
import { usePlatform } from "./PlatformContext";

export { RouteMeProvider } from "./index";

export const useRouteMe = () => {
  const auth = useAuth();
  const nurse = useNurse();
  const route = useRoute();
  const soap = useSOAP();
  const agency = useAgency();
  const platform = usePlatform();
  return { ...auth, ...nurse, ...route, ...soap, ...agency, ...platform };
};