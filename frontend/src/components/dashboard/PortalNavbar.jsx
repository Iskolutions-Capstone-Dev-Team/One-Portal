import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PortalNavbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    const firstOption = location.pathname === "/profile" ? "Dashboard" : "Profile";
    const handleFirstOption = () => {
        if (location.pathname === "/profile") {
            navigate("/portal");
        } else {
            navigate("/profile");
        }
        setDropdownOpen(false);
    };

    const handleLogout = () => {
        navigate("/");
        setDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const icons = {
        logout: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
        ),
        dashboard: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
        ),
        profile: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
        ),
    };

    return (
        <div className="header-navbar w-full bg-[#991b1b] flex items-center justify-between px-6 py-3 z-100 relative">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <img src="/assets/images/PUPlogo.png" alt="PUP Logo" className="pup-logo-img"/>
                </div>
                <div className="text-column">
                    <div className="title"> PUP TAGUIG ONE PORTAL</div>
                    <div className="subtitle">POLYTECHNIC UNIVERSITY OF THE PHILIPPINES — TAGUIG CAMPUS</div>
                </div>
            </div>
            <div className="relative">
                <button className="profile-btn" onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(!dropdownOpen);
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor">
                        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 
                        1.5c-4 0-7.5 1.79-7.5 4v1.5A1.5 1.5 0 0 0 6 21h12a1.5 
                        1.5 0 0 0 1.5-1.5V17.5c0-2.21-3.5-4-7.5-4Z"/>
                    </svg>
                </button>
                <div className={`absolute right-0 mt-2 w-44 bg-white text-black rounded-2xl shadow transition-all ${
                        dropdownOpen ? "block" : "hidden"
                    }`}
                >
                    <button className="w-full flex itemse-center gap-2 font-semibold px-4 py-2 transition-colors rounded-2xl bg-transparent hover:bg-gray-200 hover:text-[#b22222]" onClick={handleFirstOption}>
                        {firstOption === "Dashboard" ? icons.dashboard : icons.profile}
                        <span>{firstOption}</span>
                    </button>
                    <button className="w-full flex itemse-center gap-2 font-semibold px-4 py-2 transition-colors rounded-2xl bg-transparent hover:bg-gray-200 hover:text-[#b22222]" onClick={handleLogout}>
                        {icons.logout}
                        <span>Logout</span>
                </button>
                </div>
            </div>
        </div>
    );
}