import { BrowserRouter, Route, Routes } from "react-router-dom";
import Callback from "./pages/Callback";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Profile from "./pages/Profile";
import { PortalThemeProvider } from "./context/PortalThemeContext";
import { ProtectedPortalRoute } from "./routes/AppRouteGuards";
import { landingRoutes } from "./routes/landingRoutes";

export default function App() {
  return (
    <PortalThemeProvider>
      <BrowserRouter>
        <Routes>
          {landingRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/portal" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </PortalThemeProvider>
  );
}