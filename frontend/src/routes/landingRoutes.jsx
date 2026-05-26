import { Navigate } from "react-router-dom";
import { LandingRoute, PortalEntryRoute } from "./AppRouteGuards";

export const landingRoutes = [
  { path: "/", element: <PortalEntryRoute /> },
  { path: "/landing", element: <LandingRoute /> },
  { path: "/landingRoute", element: <Navigate to="/landing" replace /> },
];
