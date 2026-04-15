import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";
import Callback from "./pages/Callback";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { PortalThemeProvider } from "./context/PortalThemeContext";

function HomeRoute() {
  const [searchParams] = useSearchParams();
  const hasAuthorizationParams = searchParams.has("code") || searchParams.has("error");

  return hasAuthorizationParams ? <Callback /> : <Home />;
}

export default function App() {
  return (
    <PortalThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/portal" element={<HomeRoute />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </PortalThemeProvider>
  );
}