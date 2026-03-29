import { useState } from "react";
import PortalNavbar from "../components/dashboard/PortalNavbar";
import PortalFooter from "../components/dashboard/PortalFooter";
import ContactUs from "../components/ContactUs";
import NotificationCenter from "../components/NotificationCenter";
import { usePortalTheme } from "../context/PortalThemeContext";

export default function OnePortalLayout({ children }) {
    const { theme } = usePortalTheme();
    const [activeFloatingPanel, setActiveFloatingPanel] = useState(null);

    const toggleFloatingPanel = (panelName) => {
        setActiveFloatingPanel((currentPanel) => (
            currentPanel === panelName ? null : panelName
        ));
    };

    const closeFloatingPanel = (panelName) => {
        setActiveFloatingPanel((currentPanel) => (
            currentPanel === panelName ? null : currentPanel
        ));
    };

    return (
        <div className="portal-layout min-h-screen font-[Poppins]" data-portal-theme={theme}>
            <PortalNavbar />
            {children}
            <PortalFooter />
            <ContactUs
                isOpen={activeFloatingPanel === "contact"}
                onToggle={() => toggleFloatingPanel("contact")}
                onClose={() => closeFloatingPanel("contact")}
                skipCloseAnimation={activeFloatingPanel !== null && activeFloatingPanel !== "contact"}
            />
            <NotificationCenter
                isOpen={activeFloatingPanel === "notifications"}
                onToggle={() => toggleFloatingPanel("notifications")}
                onClose={() => closeFloatingPanel("notifications")}
                skipCloseAnimation={activeFloatingPanel !== null && activeFloatingPanel !== "notifications"}
            />
        </div>
    );
}