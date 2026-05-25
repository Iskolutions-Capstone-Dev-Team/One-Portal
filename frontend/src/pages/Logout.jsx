import { useEffect, useRef } from "react";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import { getLogoutFallbackUrl, logoutSession } from "../services/auth";

export default function Logout() {
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return undefined;
        hasRun.current = true;

        const finishLogout = async () => {
            try {
                const redirectUrl = await logoutSession();

                window.setTimeout(() => {
                    window.location.assign(redirectUrl);
                }, 500);
            } catch (error) {
                console.error("Logout request failed.", error);

                window.setTimeout(() => {
                    window.location.assign(getLogoutFallbackUrl());
                }, 500);
            }
        };

        void finishLogout();

        return undefined;
    }, []);

    return <AuthLoadingScreen message="Signing You Out" />;
}