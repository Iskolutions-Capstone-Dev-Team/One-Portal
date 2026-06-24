import { useEffect } from "react";
import { createPortal } from "react-dom";

function DeleteConfirmIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
        </svg>
    );
}

export default function MfaDeleteConfirmModal({ authenticator, isDeleting, onCancel, onConfirm }) {
    useEffect(() => {
        if (!authenticator || typeof document === "undefined") {
            return undefined;
        }

        const previousBodyOverflow = document.body.style.overflow;
        const previousDocumentOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousDocumentOverflow;
        };
    }, [authenticator]);

    if (!authenticator || typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <dialog open className="modal modal-open mfa-delete-modal">
            <div className="modal-box mfa-delete-modal__box">
                <div className="mfa-delete-modal__icon" aria-hidden="true">
                    <DeleteConfirmIcon />
                </div>

                <h3 className="mfa-delete-modal__title">Delete {authenticator.name || "Authenticator"}?</h3>
                <p className="mfa-delete-modal__message">This action cannot be undone.</p>

                <div className="mfa-delete-modal__actions">
                    <button type="button" className="profile-action profile-action--secondary mfa-delete-modal__button" onClick={onCancel} disabled={isDeleting}>
                        Cancel
                    </button>
                    <button type="button" className="profile-action profile-action--primary mfa-delete-modal__button" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onCancel} disabled={isDeleting}>close</button>
            </form>
        </dialog>,
        document.body
    );
}
