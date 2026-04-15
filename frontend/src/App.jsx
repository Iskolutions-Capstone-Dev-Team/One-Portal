import { BrowserRouter, Route, Routes } from "react-router-dom";
import Callback from "./pages/Callback";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { PortalThemeProvider } from "./context/PortalThemeContext";

export default function App() {
  return (
    <PortalThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/portal" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </PortalThemeProvider>
  );
}