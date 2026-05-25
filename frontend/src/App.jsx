import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";
import Callback from "./pages/Callback";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { PortalThemeProvider } from "./context/PortalThemeContext";

function LandingRoute() {
  const [searchParams] = useSearchParams();
  const hasAuthorizationParams = searchParams.has("code") || searchParams.has("error");

  return hasAuthorizationParams ? <Callback /> : <Landing />;
}

export default function App() {
  return (
    <PortalThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/landingRoute" element={<LandingRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/portal" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </PortalThemeProvider>
  );
}
