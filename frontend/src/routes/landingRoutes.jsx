import { LandingRoute, PortalEntryRoute, PortalShortcutRoute } from "./AppRouteGuards";

export const landingRoutes = [
  { path: "/", element: <PortalEntryRoute /> },
  { path: "/landing", element: <LandingRoute /> },
  { path: "/landingRoute", element: <PortalShortcutRoute /> },
];
