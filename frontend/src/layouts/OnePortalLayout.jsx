import { useEffect } from "react";
import PortalNavbar from "../components/dashboard/PortalNavbar";
import PortalFooter from "../components/dashboard/PortalFooter";
import FloatingActionMenu from "../components/FloatingActionMenu";
import { usePortalTheme } from "../context/PortalThemeContext";
import { clearSessionRefreshTimestamp, getSessionRefreshDelay, refreshSession } from "../services/auth";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export default function OnePortalLayout({ children }) {
    const { theme } = usePortalTheme();

    useEffect(() => {
        let intervalId = 0;
        let timeoutId = 0;

        const syncSession = async () => {
            try {
                await refreshSession();
            } catch (error) {
                if (error.status === 401) {
                    clearSessionRefreshTimestamp();
                    return;
                }

                console.error("Failed to refresh the current session.", error);
            }
        };

        const initialDelay = getSessionRefreshDelay(REFRESH_INTERVAL_MS);

        timeoutId = window.setTimeout(() => {
            void syncSession();

            intervalId = window.setInterval(() => {
                void syncSession();
            }, REFRESH_INTERVAL_MS);
        }, initialDelay);

        return () => {
            window.clearTimeout(timeoutId);
            window.clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="portal-layout min-h-screen font-[Poppins]" data-portal-theme={theme}>
            <PortalNavbar />
            {children}
            <PortalFooter />
            <FloatingActionMenu />
        </div>
    );
}
