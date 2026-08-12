import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PortalThemeProvider } from "../providers/PortalThemeProvider";
import { ProtectedPortalRoute } from "../routes/guards/AppRouteGuards";
import { landingRoutes } from "../routes/routeConfig";
import { ROUTE_PATHS } from "../routes/routePaths";
import { authPageBackground, authPagePatternStyle } from "../utils/authBackground";
import { Toaster } from "@/components/ui/sonner";

const Callback = lazy(() => import("../pages/Callback"));
const Home = lazy(() => import("../features/portal/pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Logout = lazy(() => import("../pages/Logout"));
const Profile = lazy(() => import("../features/profile/pages/Profile"));

export default function App() {
  return (
    <PortalThemeProvider>
      <BrowserRouter>
        <Suspense fallback={
          <div className="relative flex min-h-screen items-center justify-center overflow-hidden" style={{ background: authPageBackground }}>
            <div className="absolute inset-0">
              <div className="absolute inset-0 opacity-45 [mask-image:linear-gradient(90deg,#000_0%,transparent_24%,transparent_76%,#000_100%)]" style={authPagePatternStyle} />
            </div>
            <span className="loading loading-dots w-10 text-[#f8d24e] relative z-10"></span>
          </div>
        }>
          <Routes>
            {landingRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
            <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
            <Route path={ROUTE_PATHS.CALLBACK} element={<Callback />} />
            <Route path={ROUTE_PATHS.LOGOUT} element={<Logout />} />
            <Route path={ROUTE_PATHS.PORTAL} element={<ProtectedPortalRoute><Home /></ProtectedPortalRoute>} />
            <Route path={ROUTE_PATHS.PROFILE} element={<ProtectedPortalRoute><Profile /></ProtectedPortalRoute>} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
      </BrowserRouter>
    </PortalThemeProvider>
  );
}