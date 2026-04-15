import { useState } from "react";
import { navigateToLoginPage, navigateToRegisterPage } from "../services/auth";
import "../styles/AuthEntry.css";

function LoginIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path
                fillRule="evenodd"
                d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6Zm-5.03 4.72a.75.75 0 0 0 0 1.06l1.72 1.72H2.25a.75.75 0 0 0 0 1.5h10.94l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 0 0-1.06 0Z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function RegisterIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
        </svg>
    );
}

export default function Landing() {
    const [pendingAction, setPendingAction] = useState("");

    const handleLoginClick = () => {
        setPendingAction("login");
        navigateToLoginPage();
    };

    const handleRegisterClick = () => {
        setPendingAction("register");
        navigateToRegisterPage();
    };

    return (
        <div className="auth-entry auth-entry--landing">
            <div className="auth-entry__background" aria-hidden="true">
                <img src="/assets/images/pup_bg.png" alt="" className="auth-entry__background-image" />
                <div className="auth-entry__background-overlay" />
            </div>

            <div className="auth-entry__shell">
                <header className="auth-entry__brand">
                    <img src="/assets/images/PUPlogo.png" alt="PUP Taguig seal" className="auth-entry__logo" />

                    <div className="auth-entry__brand-copy">
                        <p className="auth-entry__brand-name">PUP Taguig One Portal</p>
                        <p className="auth-entry__brand-line">POLYTECHNIC UNIVERSITY OF THE PHILIPPINES - TAGUIG CAMPUS</p>
                    </div>
                </header>

                <main className="auth-entry__hero">
                    <section className="auth-entry__content">
                        <p className="auth-entry__eyebrow">One Portal</p>
                        <h1 className="auth-entry__title">
                            Access your PUP Taguig
                            <span className="auth-entry__title-accent"> systems in one portal.</span>
                        </h1>
                        <p className="auth-entry__description">
                            Academic, administrative, and campus services from a single secure starting point.
                        </p>
                    </section>

                    <aside className="auth-entry__portal-card">
                        <div className="auth-entry__portal-mark">
                            <img src="/assets/images/PUPlogo.png" alt="" className="auth-entry__portal-logo" />
                        </div>

                        <h2 className="auth-entry__portal-title">Portal Access</h2>

                        <div className="auth-entry__portal-actions">
                            <button
                                type="button"
                                className="auth-entry__portal-button"
                                onClick={handleLoginClick}
                                disabled={Boolean(pendingAction)}
                            >
                                <span className="auth-entry__portal-button-icon" aria-hidden="true">
                                    <LoginIcon />
                                </span>
                                <span>{pendingAction === "login" ? "Opening..." : "Login"}</span>
                            </button>

                            <button
                                type="button"
                                className="auth-entry__portal-button auth-entry__portal-button--secondary"
                                onClick={handleRegisterClick}
                                disabled={Boolean(pendingAction)}
                            >
                                <span className="auth-entry__portal-button-icon" aria-hidden="true">
                                    <RegisterIcon />
                                </span>
                                <span>{pendingAction === "register" ? "Opening..." : "Register"}</span>
                            </button>
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
}
