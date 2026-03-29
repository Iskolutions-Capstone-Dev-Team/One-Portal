import PortalNavbar from "../components/dashboard/PortalNavbar";
import PortalFooter from "../components/dashboard/PortalFooter";
import NotificationCenter from "../components/NotificationCenter";
import { usePortalTheme } from "../context/PortalThemeContext";

export default function OnePortalLayout({ children }) {
    const { theme } = usePortalTheme();

    return (
        <div className="portal-layout min-h-screen font-[Poppins]" data-portal-theme={theme}>
            <PortalNavbar />
            {children}
            <PortalFooter />
            <NotificationCenter />
        </div>
    );
}
