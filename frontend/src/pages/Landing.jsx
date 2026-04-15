import { useState } from "react";
import { navigateToLoginPage } from "../services/auth";
import "../styles/AuthEntry.css";

const ACCESS_GROUPS = ["Students", "Faculty", "Staff"];

export default function Landing() {
    const [isRedirectingToLogin, setIsRedirectingToLogin] = useState(false);

    const handleLogin = () => {
        setIsRedirectingToLogin(true);
        navigateToLoginPage();
    };

    return (
        <div className="auth-entry auth-entry--landing">
            <div className="auth-entry__background" aria-hidden="true">
                <img src="/assets/images/pup_bg.png" alt="" className="auth-entry__background-image" />
                <div className="auth-entry__background-overlay" />
            </div>

            <div className="auth-entry__shell">
                <header className="auth-entry__brand">
                    <img src="/assets/images/PUPlogo.png" alt="PUP Taguig seal" className="auth-entry__logo float-logo" />

                    <div className="auth-entry__brand-copy">
                        <p className="auth-entry__brand-name">PUP Taguig One Portal</p>
                        <p className="auth-entry__brand-line">A simpler entry point for campus systems.</p>
                    </div>
                </header>

                <main className="auth-entry__hero">
                    <section className="auth-entry__content">
                        <p className="auth-entry__eyebrow">One Portal</p>
                        <h1 className="auth-entry__title">Start in one place.</h1>
                        <p className="auth-entry__description">
                            Clean, focused access to the systems you need.
                        </p>

                        <div className="auth-entry__actions">
                            <button
                                type="button"
                                className="auth-entry__button"
                                onClick={handleLogin}
                                disabled={isRedirectingToLogin}
                            >
                                {isRedirectingToLogin ? "Opening login..." : "Login with IDP"}
                            </button>
                        </div>
                    </section>

                    <aside className="auth-entry__panel" aria-hidden="true">
                        <div className="auth-entry__chips">
                            {ACCESS_GROUPS.map((group) => (
                                <span key={group} className="auth-entry__chip">
                                    {group}
                                </span>
                            ))}
                        </div>

                        <div className="auth-entry__panel-card">
                            <p className="auth-entry__panel-label">Secure access</p>
                            <p className="auth-entry__panel-copy">Move from the landing page to the IDP login and into One Portal.</p>
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
}
