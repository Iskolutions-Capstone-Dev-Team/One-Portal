import { useEffect } from "react";
import { createPortal } from "react-dom";
import { DeleteConfirmIcon } from "./profileIcons";

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
