import { useCallback, useEffect, useState } from "react";
import SuccessAlert from "../SuccessAlert";
import { deleteAuthenticator, getAuthenticators } from "../../services/userMfa";
import { formatTimestamp } from "../../utils/formatTimestamp";
import MfaDeleteConfirmModal from "./MfaDeleteConfirmModal";
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

function formatAuthenticatorType(value) {
    if (!value) {
        return "TOTP";
    }

    const type = String(value);

    if (type.toLowerCase() === "passkey") {
        return "Passkey";
    }

    return type.toUpperCase();
}

function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    );
}

export default function AuthenticatorApps({ email, isProfileLoading = false }) {
    const [authenticators, setAuthenticators] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [pendingDeleteAuthenticator, setPendingDeleteAuthenticator] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    const loadAuthenticators = useCallback(async () => {
        if (isProfileLoading) {
            setAuthenticators([]);
            setIsLoading(true);
            setErrorMessage("");
            return;
        }

        if (!email) {
            setAuthenticators([]);
            setIsLoading(false);
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
    }, [email, isProfileLoading]);

    useEffect(() => {
        void loadAuthenticators();
    }, [loadAuthenticators]);

    const handleDeleteClick = (authenticator) => {
        setPendingDeleteAuthenticator(authenticator);
        setErrorMessage("");
    };

    const handleCancelDelete = () => {
        if (deletingId) {
            return;
        }

        setPendingDeleteAuthenticator(null);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteAuthenticator) {
            return;
        }

        setDeletingId(pendingDeleteAuthenticator.id);
        setErrorMessage("");

        try {
            await deleteAuthenticator({ email, id: pendingDeleteAuthenticator.id });
            await loadAuthenticators();
            setToastMessage("Authenticator removed successfully!");
            setPendingDeleteAuthenticator(null);
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
                    <p className="mfa-panel__message">
                        {isProfileLoading ? "Loading profile..." : "Loading authenticators..."}
                    </p>
                ) : !email ? (
                    <p className="mfa-panel__empty">Reload the page or sign in again.</p>
                ) : (
                    <div className="mfa-panel__grid">
                        {authenticators.map((authenticator) => (
                            <article key={authenticator.id} className="mfa-card">
                                <button type="button" className="mfa-card__delete" onClick={() => handleDeleteClick(authenticator)} disabled={deletingId === authenticator.id} aria-label={`Delete ${authenticator.name || "authenticator"}`}>
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
                                    <p className="mfa-card__type">Type: {formatAuthenticatorType(authenticator.type)}</p>
                                </div>

                                <div className="mfa-card__dates">
                                    <p>
                                        <span className="mfa-card__date-icon">
                                            <CalendarIcon />
                                        </span>
                                        <span>Added: {formatAuthenticatorDate(authenticator.createdAt)}</span>
                                    </p>
                                    <p>
                                        <span className="mfa-card__date-icon">
                                            <ClockIcon />
                                        </span>
                                        <span>Last used: {formatAuthenticatorDate(authenticator.lastUsedAt)}</span>
                                    </p>
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

            <MfaDeleteConfirmModal
                authenticator={pendingDeleteAuthenticator}
                isDeleting={Boolean(deletingId)}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />

            <SuccessAlert
                message={toastMessage}
                onClose={() => setToastMessage("")}
            />
        </>
    );
}