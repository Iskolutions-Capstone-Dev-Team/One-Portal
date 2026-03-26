import { useEffect, useState } from "react";

export default function ErrorAlert({ message, onClose, autoCloseMs = 3000 }) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        let showTimeout;
        let fadeTimeout;
        let autoCloseTimeout;

        if (message) {
            setShouldRender(true);

            showTimeout = setTimeout(() => setIsVisible(true), 10);

            autoCloseTimeout = setTimeout(() => {
                setIsVisible(false);

                fadeTimeout = setTimeout(() => {
                    onClose?.();
                    setShouldRender(false);
                }, 300);
            }, autoCloseMs);
        } else {
            setIsVisible(false);

            fadeTimeout = setTimeout(() => {
                setShouldRender(false);
            }, 300);
        }

        return () => {
            clearTimeout(showTimeout);
            clearTimeout(autoCloseTimeout);
            clearTimeout(fadeTimeout);
        };
    }, [message, onClose, autoCloseMs]);

    const handleClose = () => {
        setIsVisible(false);

        setTimeout(() => {
            onClose?.();
            setShouldRender(false);
        }, 300);
    };

    if (!shouldRender) {
        return null;
    }

    return (
        <div className={`profile-alert profile-alert--error profile-alert--dismissible profile-alert--animated ${isVisible ? "is-visible" : ""}`} role="alert">
            <span className="profile-alert__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </span>

            <p className="profile-alert__message">{message}</p>

            {onClose && (
                <button type="button" className="profile-alert__close" onClick={handleClose} aria-label="Dismiss error alert">
                    x
                </button>
            )}
        </div>
    );
}