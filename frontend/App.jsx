import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/pages/Login";
import Callback from "./auth/pages/Callback";
import Unauthorized from "./auth/pages/Unauthorized";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import OnePortalHome from "./features/one-portal/pages/OnePortalHome";
import OnePortalProfile from "./features/one-portal/pages/Profile";
import AppClient from "./features/idp/pages/AppClient";
import UserPool from "./features/idp/pages/UserPool";
import Roles from "./features/idp/pages/Roles";
import IdpProfile from "./features/idp/pages/Profile";
import IdpLayout from "./features/idp/layouts/IdpLayout";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/401" element={<Unauthorized />} />

        {/* Protected IDP Routes */}
        <Route
          element={
            <ProtectedRoute>
              <IdpLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/idp/app-client" element={<AppClient />} />
          <Route path="/idp/user-pool" element={<UserPool />} />
          <Route path="/idp/role" element={<Roles />} />
          <Route path="/idp/profile" element={<IdpProfile />} />
        </Route>

        {/* Protected Portal Routes */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <OnePortalHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <OnePortalProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}