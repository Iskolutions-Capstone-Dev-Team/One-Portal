import { useEffect, useRef } from "react";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import { clearSessionRefreshTimestamp, getLogoutFallbackUrl, logoutSession } from "../services/auth";

export default function Logout() {
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) {
            return;
        }

        hasRun.current = true;

        const finishLogout = async () => {
            try {
                const redirectUrl = await logoutSession();
                clearSessionRefreshTimestamp();
                window.location.assign(redirectUrl);
            } catch (error) {
                console.error("Logout request failed.", error);
                clearSessionRefreshTimestamp();
                window.location.assign(getLogoutFallbackUrl());
            }
        };

        void finishLogout();
    }, []);

    return <AuthLoadingScreen message="Signing You Out" />;
}