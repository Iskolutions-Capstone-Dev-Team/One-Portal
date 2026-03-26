import { useEffect, useState } from "react";

export default function SuccessAlert({ message, onClose }) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        let fadeTimeout;
        let autoCloseTimeout;

        if (message) {
            setShouldRender(true);

            setTimeout(() => setIsVisible(true), 10);

            autoCloseTimeout = setTimeout(() => {
                setIsVisible(false);

                fadeTimeout = setTimeout(() => {
                    onClose?.();
                }, 300);
            }, 4000);
        } else {
            setIsVisible(false);

            fadeTimeout = setTimeout(() => {
                setShouldRender(false);
            }, 300);
        }

        return () => {
            clearTimeout(autoCloseTimeout);
            clearTimeout(fadeTimeout);
        };
    }, [message, onClose]);

    if (!shouldRender) return null;

    return (
        <div className="profile-toast-shell">
            <div role="alert" className={`profile-toast profile-toast--success ${isVisible ? "is-visible" : ""}`}>
                <span className="profile-toast__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </span>

                <span className="profile-toast__message">{message}</span>

                {onClose && (
                    <button type="button" onClick={onClose} className="profile-toast__close" aria-label="Dismiss alert">
                        x
                    </button>
                )}
            </div>
        </div>
    );
}