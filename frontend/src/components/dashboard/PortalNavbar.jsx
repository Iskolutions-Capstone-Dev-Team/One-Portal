import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePortalTheme } from "../../context/PortalThemeContext";
import { clearSessionRefreshTimestamp, getLogoutFallbackUrl, logoutSession } from "../../services/auth";

export default function PortalNavbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const { isDarkMode, toggleTheme } = usePortalTheme();
    const isProfilePage = location.pathname === "/profile";
    const firstOption = isProfilePage ? "Dashboard" : "Profile";
    const themeLabel = isDarkMode ? "Switch to light mode" : "Switch to dark mode";

    const handleFirstOption = () => {
        navigate(isProfilePage ? "/portal" : "/profile");
        setDropdownOpen(false);
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setDropdownOpen(false);

        try {
            const redirectUrl = await logoutSession();
            clearSessionRefreshTimestamp();
            window.location.assign(redirectUrl);
        } catch (error) {
            console.error("Logout request failed.", error);
            clearSessionRefreshTimestamp();
            window.location.assign(getLogoutFallbackUrl());
        } finally {
            setIsLoggingOut(false);
        }
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
        moon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="portal-header__theme-icon" aria-hidden="true">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd"/>
            </svg>
        ),
        sun: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="portal-header__theme-icon" aria-hidden="true">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
            </svg>
        ),
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
                    <button type="button" className={`portal-header__theme-button ${isDarkMode ? "is-active" : ""}`} aria-label={themeLabel} title={themeLabel} onClick={toggleTheme}>
                        <span className="portal-header__theme-icon-stack" aria-hidden="true">
                            <span className={`portal-header__theme-icon-slot ${!isDarkMode ? "is-visible" : ""}`}>
                                {icons.moon}
                            </span>
                            <span className={`portal-header__theme-icon-slot ${isDarkMode ? "is-visible" : ""}`}>
                                {icons.sun}
                            </span>
                        </span>
                        <span className="sr-only">{themeLabel}</span>
                    </button>

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

                        <button type="button" className="portal-header__menu-item" onClick={handleLogout} disabled={isLoggingOut}>
                            <span className="portal-header__menu-icon" aria-hidden="true">
                                {icons.logout}
                            </span>
                            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}