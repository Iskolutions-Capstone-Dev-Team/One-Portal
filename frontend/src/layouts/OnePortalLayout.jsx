import PortalNavbar from "../components/dashboard/PortalNavbar";
import PortalFooter from "../components/dashboard/PortalFooter";

export default function OnePortalLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-200 text-gray-800 font-[Poppins]">
            <PortalNavbar />
                {children} 
            <PortalFooter />
        </div>
    );
}