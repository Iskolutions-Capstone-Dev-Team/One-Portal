import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PortalNavbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const isProfilePage = location.pathname === "/profile";
    const firstOption = isProfilePage ? "Dashboard" : "Profile";

    const handleFirstOption = () => {
        navigate(isProfilePage ? "/portal" : "/profile");
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd"/>
            </svg>
        ),
        dashboard: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z" clipRule="evenodd"/>
            </svg>
        ),
        profile: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd"/>
            </svg>
        ),
    };

    return (
        <header className="portal-header">
            <span className="portal-header__glow portal-header__glow--left" aria-hidden="true" />
            <span className="portal-header__glow portal-header__glow--right" aria-hidden="true" />

            <div className="portal-header__inner">
                <div className="portal-header__brand">
                    <img src="/assets/images/PUPlogo.png" alt="PUP Logo" className="portal-header__logo"/>

                    <div className="portal-header__text">
                        <div className="portal-header__title">PUP TAGUIG ONE PORTAL</div>
                        <div className="portal-header__subtitle">
                            POLYTECHNIC UNIVERSITY OF THE PHILIPPINES - TAGUIG CAMPUS
                        </div>
                    </div>
                </div>

                <div className="portal-header__actions" ref={dropdownRef}>
                    <button type="button" className={`portal-header__profile-button ${dropdownOpen ? "is-open" : ""}`} aria-expanded={dropdownOpen} aria-haspopup="menu" aria-label="Open portal menu" onClick={() => setDropdownOpen((currentOpen) => !currentOpen)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="portal-header__profile-icon" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd"/>
                        </svg>
                        <span className="sr-only">Quick Menu</span>
                    </button>

                    <div className={`portal-header__menu ${dropdownOpen ? "is-open" : ""}`} role="menu">
                        <button type="button" className="portal-header__menu-item" onClick={handleFirstOption}>
                            <span className="portal-header__menu-icon" aria-hidden="true">
                                {firstOption === "Dashboard" ? icons.dashboard : icons.profile}
                            </span>
                            <span>{firstOption}</span>
                        </button>

                        <button type="button" className="portal-header__menu-item" onClick={handleLogout}>
                            <span className="portal-header__menu-icon" aria-hidden="true">
                                {icons.logout}
                            </span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
