import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { startAuthorization } from "../services/auth";
import "../styles/AuthEntry.css";

export default function Login() {
    const [isStartingAuthorization, setIsStartingAuthorization] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const beginAuthorization = async () => {
        setIsStartingAuthorization(true);
        setErrorMessage("");

        try {
            await startAuthorization();
        } catch (error) {
            setErrorMessage(error.message || "Unable to continue to the IDP right now.");
            setIsStartingAuthorization(false);
        }
    };

    useEffect(() => {
        void beginAuthorization();
    }, []);

    return (
        <div className="auth-entry auth-entry--login">
            <div className="auth-entry__background" aria-hidden="true">
                <img src="/assets/images/pup_bg.png" alt="" className="auth-entry__background-image" />
                <div className="auth-entry__background-overlay" />
            </div>

            <div className="auth-entry__shell auth-entry__shell--compact">
                <header className="auth-entry__brand auth-entry__brand--centered">
                    <img src="/assets/images/PUPlogo.png" alt="PUP Taguig seal" className="auth-entry__logo" />

                    <div className="auth-entry__brand-copy">
                        <p className="auth-entry__brand-name">PUP Taguig One Portal</p>
                        <p className="auth-entry__brand-line">Preparing your secure sign-in.</p>
                    </div>
                </header>

                <main className="auth-entry__login-shell">
                    <section className="auth-entry__login-card">
                        <p className="auth-entry__eyebrow">Secure Sign-In</p>
                        <h1 className="auth-entry__title auth-entry__title--compact">Redirecting to IDP</h1>
                        <p className="auth-entry__description auth-entry__description--compact">
                            {errorMessage || "Please wait while we open the login page."}
                        </p>

                        {errorMessage ? (
                            <div className="auth-entry__actions auth-entry__actions--stacked">
                                <button
                                    type="button"
                                    className="auth-entry__button"
                                    onClick={() => void beginAuthorization()}
                                    disabled={isStartingAuthorization}
                                >
                                    {isStartingAuthorization ? "Opening..." : "Login with IDP"}
                                </button>

                                <Link to="/" className="auth-entry__link">
                                    Return to landing page
                                </Link>
                            </div>
                        ) : (
                            <div className="auth-entry__status" aria-live="polite">
                                <span className="auth-entry__status-dot" />
                                <span>{isStartingAuthorization ? "Opening your secure login..." : "Redirecting..."}</span>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
