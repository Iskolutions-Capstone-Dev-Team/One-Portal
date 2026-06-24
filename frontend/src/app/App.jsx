import { BrowserRouter, Route, Routes } from "react-router-dom";
import Callback from "../pages/Callback";
import Home from "../features/portal/pages/Home";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Profile from "../features/profile/pages/Profile";
import { PortalThemeProvider } from "../providers/PortalThemeProvider";
import { ProtectedPortalRoute } from "../routes/guards/AppRouteGuards";
import { landingRoutes } from "../routes/routeConfig";
import { ROUTE_PATHS } from "../routes/routePaths";

export default function App() {
  return (
    <PortalThemeProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </PortalThemeProvider>
  );
}