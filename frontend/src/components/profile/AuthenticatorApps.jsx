import { useCallback, useEffect, useState } from "react";
import SuccessAlert from "../SuccessAlert";
import { deleteAuthenticator, getAuthenticators } from "../../services/userMfa";
import { formatTimestamp } from "../../utils/formatTimestamp";
import MfaSetupModal from "./MfaSetupModal";

function formatAuthenticatorDate(value) {
    if (!value) {
        return "Never";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return formatTimestamp(date.toISOString());
}

export default function AuthenticatorApps({ email }) {
    const [authenticators, setAuthenticators] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    const loadAuthenticators = useCallback(async () => {
        if (!email) {
            setAuthenticators([]);
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
            const authenticatorList = await getAuthenticators(email);
            setAuthenticators(authenticatorList);
        } catch (error) {
            setErrorMessage(error.message || "Failed to load authenticators.");
        } finally {
            setIsLoading(false);
        }
    }, [email]);

    useEffect(() => {
        void loadAuthenticators();
    }, [loadAuthenticators]);

    const handleDelete = async (authenticator) => {
        if (!window.confirm(`Remove ${authenticator.name || "this authenticator"}?`)) {
            return;
        }

        setDeletingId(authenticator.id);
        setErrorMessage("");

        try {
            await deleteAuthenticator({ email, id: authenticator.id });
            await loadAuthenticators();
            setToastMessage("Authenticator removed successfully!");
        } catch (error) {
            setErrorMessage(error.message || "Failed to remove authenticator.");
        } finally {
            setDeletingId("");
        }
    };

    const handleSaved = async () => {
        await loadAuthenticators();
        setToastMessage("Authenticator added successfully!");
    };

    return (
        <>
            <section className="mfa-panel">
                <div className="mfa-panel__header">
                    <div>
                        <h3 className="mfa-panel__title">Authenticator Apps</h3>
                        <p className="mfa-panel__description">Manage the authenticator apps connected to your account.</p>
                    </div>

                    <button type="button" className="profile-action profile-action--primary mfa-panel__add" onClick={() => setModalOpen(true)} disabled={!email}>
                        + New Connection
                    </button>
                </div>

                {errorMessage && (
                    <p className="mfa-panel__message mfa-panel__message--error">{errorMessage}</p>
                )}

                {isLoading ? (
                    <p className="mfa-panel__message">Loading authenticators...</p>
                ) : (
                    <div className="mfa-panel__grid">
                        {authenticators.map((authenticator) => (
                            <article key={authenticator.id} className="mfa-card">
                                <button type="button" className="mfa-card__delete" onClick={() => handleDelete(authenticator)} disabled={deletingId === authenticator.id} aria-label={`Delete ${authenticator.name || "authenticator"}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4h6v3m-8 0h10" />
                                    </svg>
                                </button>

                                <div className="mfa-card__icon" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3l7 3v5c0 4.3-2.7 8.1-7 9.8C7.7 19.1 5 15.3 5 11V6l7-3z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 12l1.7 1.7 3.4-4.1" />
                                    </svg>
                                </div>

                                <div className="mfa-card__content">
                                    <h4 className="mfa-card__name">{authenticator.name || "Authenticator"}</h4>
                                    <p className="mfa-card__type">Type: {authenticator.type || "totp"}</p>
                                </div>

                                <div className="mfa-card__dates">
                                    <p>Added: {formatAuthenticatorDate(authenticator.createdAt)}</p>
                                    <p>Last used: {formatAuthenticatorDate(authenticator.lastUsedAt)}</p>
                                </div>
                            </article>
                        ))}

                        {!authenticators.length && (
                            <p className="mfa-panel__empty">No authenticator apps connected yet.</p>
                        )}
                    </div>
                )}
            </section>

            <MfaSetupModal
                isOpen={isModalOpen}
                email={email}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />

            <SuccessAlert
                message={toastMessage}
                onClose={() => setToastMessage("")}
            />
        </>
    );
}