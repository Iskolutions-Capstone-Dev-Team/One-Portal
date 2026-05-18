import { LoginIcon, MenuIcon } from "./LandingIcons";
import { navItems } from "./landingContent";

export default function LandingNavbar({ pendingAction, onLoginClick }) {
    return (
        <header className="landing-navbar">
            <div className="landing-navbar__start">
                <details className="landing-navbar__dropdown">
                    <summary className="landing-navbar__menu-button" aria-label="Open menu">
                        <MenuIcon />
                    </summary>
                    <ul className="landing-navbar__dropdown-menu">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <a href={item.href}>{item.label}</a>
                            </li>
                        ))}
                    </ul>
                </details>

                <a href="#home" className="landing-navbar__brand">
                    <img src="/assets/images/PUPlogo.png" alt="" />
                    <span>One Portal</span>
                </a>
            </div>

            <nav className="landing-navbar__center" aria-label="Landing sections">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <a href={item.href}>{item.label}</a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="landing-navbar__end">
                <button type="button" className="landing-navbar__login" onClick={onLoginClick} disabled={Boolean(pendingAction)}>
                    <span className="landing-navbar__login-icon" aria-hidden="true">
                        <LoginIcon />
                    </span>
                    <span>{pendingAction === "login" ? "Opening..." : "Login"}</span>
                </button>
            </div>
        </header>
    );
}