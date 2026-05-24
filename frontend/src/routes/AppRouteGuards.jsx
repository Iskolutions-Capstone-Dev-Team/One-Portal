import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Callback from "../pages/Callback";
import Landing from "../pages/Landing";
import { clearSessionState } from "../services/auth";
import { getCurrentUserProfile } from "../services/userProfile";

export function LandingRoute() {
  const [searchParams] = useSearchParams();
  const hasAuthorizationParams = searchParams.has("code") || searchParams.has("error");

  return hasAuthorizationParams ? <Callback /> : <Landing />;
}

export function PortalEntryRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const hasAuthorizationParams = searchParams.has("code") || searchParams.has("error");

  useEffect(() => {
    if (hasAuthorizationParams) {
      return undefined;
    }

    let isMounted = true;

    const openPortalIfUserExists = async () => {
      try {
        await getCurrentUserProfile({ forceRefresh: true });

        if (isMounted) {
          navigate("/portal", { replace: true });
        }
      } catch {
        clearSessionState();

        if (isMounted) {
          navigate("/landing", { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsCheckingUser(false);
        }
      }
    };

    void openPortalIfUserExists();

    return () => {
      isMounted = false;
    };
  }, [hasAuthorizationParams, navigate]);

  if (hasAuthorizationParams) {
    return <Callback />;
  }

  return isCheckingUser ? null : <Landing />;
}

export function ProtectedPortalRoute({ children }) {
  const navigate = useNavigate();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyCurrentUser = async () => {
      try {
        await getCurrentUserProfile({ forceRefresh: true });

        if (isMounted) {
          setIsCheckingUser(false);
        }
      } catch {
        clearSessionState();

        if (isMounted) {
          navigate("/landing", { replace: true });
        }
      }
    };

    void verifyCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return isCheckingUser ? null : children;
}
