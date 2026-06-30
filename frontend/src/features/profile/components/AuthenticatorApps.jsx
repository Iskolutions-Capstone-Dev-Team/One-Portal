import { useCallback, useEffect, useState } from "react";
import SuccessAlert from "../../../components/feedback/SuccessAlert";
import { deleteAuthenticator, getAuthenticators } from "../../../services/userMfa";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import MfaDeleteConfirmModal from "./MfaDeleteConfirmModal";
import MfaSetupModal from "./MfaSetupModal";
import { AuthenticatorTypeIcon, CalendarIcon, ClockIcon, TrashIcon } from "./profileIcons";

const AUTHENTICATORS_PER_SLIDE = 3;

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
        return "authenticator app";
    }

    const type = String(value).toLowerCase();

    if (type === "passkey") {
        return "passkey";
    }

    if (type === "totp") {
        return "authenticator app";
    }

    return type;
}

export default function AuthenticatorApps({ email, isProfileLoading = false }) {
    const [authenticators, setAuthenticators] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
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

    useEffect(() => {
        setCurrentSlide(0);
    }, [authenticators.length]);

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

    const slideCount = Math.ceil(authenticators.length / AUTHENTICATORS_PER_SLIDE);
    const hasCarouselControls = slideCount > 1;
    const authenticatorSlides = Array.from({ length: slideCount }, (_, slideIndex) =>
        authenticators.slice(
            slideIndex * AUTHENTICATORS_PER_SLIDE,
            slideIndex * AUTHENTICATORS_PER_SLIDE + AUTHENTICATORS_PER_SLIDE,
        ),
    );

    const goToPreviousSlide = () => {
        setCurrentSlide((slide) => (slide === 0 ? slideCount - 1 : slide - 1));
    };

    const goToNextSlide = () => {
        setCurrentSlide((slide) => (slide + 1) % slideCount);
    };

    const renderAuthenticatorCard = (authenticator) => (
        <article key={authenticator.id} className="mfa-card">
            <button type="button" className="mfa-card__delete" onClick={() => handleDeleteClick(authenticator)} disabled={deletingId === authenticator.id} aria-label={`Delete ${authenticator.name || "authenticator"}`}>
                <TrashIcon />
            </button>

            <div className="mfa-card__icon" aria-hidden="true">
                <AuthenticatorTypeIcon type={authenticator.type} />
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
    );

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
                    <div className="mfa-panel__cards">
                        <div className="mfa-panel__grid">
                            {authenticators.map(renderAuthenticatorCard)}
                        </div>

                        <div className="carousel mfa-panel__carousel">
                            <div className="mfa-panel__carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                {authenticatorSlides.map((slideAuthenticators, slideIndex) => (
                                    <div key={slideIndex} className="carousel-item mfa-panel__carousel-slide">
                                        <div className="mfa-panel__carousel-grid">
                                            {slideAuthenticators.map(renderAuthenticatorCard)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {hasCarouselControls && (
                            <>
                                <div className="mfa-panel__carousel-controls">
                                    <button type="button" className="btn btn-circle mfa-panel__carousel-button" onClick={goToPreviousSlide} aria-label="Show previous authenticators">
                                        &#10094;
                                    </button>
                                    <button type="button" className="btn btn-circle mfa-panel__carousel-button" onClick={goToNextSlide} aria-label="Show next authenticators">
                                        &#10095;
                                    </button>
                                </div>

                                <div className="mfa-panel__carousel-pages" aria-label="Authenticator carousel pages">
                                    {authenticatorSlides.map((_, slideIndex) => (
                                        <button key={slideIndex} type="button" className={`mfa-panel__carousel-page ${slideIndex === currentSlide ? "is-active" : ""}`} onClick={() => setCurrentSlide(slideIndex)} aria-label={`Show authenticator page ${slideIndex + 1}`} aria-current={slideIndex === currentSlide ? "page" : undefined}/>
                                    ))}
                                </div>
                            </>
                        )}

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
