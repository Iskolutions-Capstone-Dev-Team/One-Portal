import { LandingRoute, PortalEntryRoute, PortalShortcutRoute } from "./guards/AppRouteGuards";
import { ROUTE_PATHS } from "./routePaths";

export const landingRoutes = [
  { path: ROUTE_PATHS.ROOT, element: <PortalEntryRoute /> },
  { path: ROUTE_PATHS.LANDING, element: <LandingRoute /> },
  { path: ROUTE_PATHS.LANDING_SHORTCUT, element: <PortalShortcutRoute /> },
];
