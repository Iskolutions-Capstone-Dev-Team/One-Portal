import { SuccessCheckIcon, SecurityNoteIcon } from "./profileIcons";

export default function SuccessStep({ onClose }) {
    return (
        <section className="profile-modal__surface">
            <div className="profile-modal__hero profile-modal__hero--success">
                <div>
                    <h3 className="profile-modal__title">Success!</h3>
                    <p className="profile-modal__subtitle">Password changed successfully</p>
                </div>
            </div>

            <div className="profile-modal__body">
                <div className="profile-success">
                    <div className="profile-success__icon" aria-hidden="true">
                        <SuccessCheckIcon />
                    </div>

                    <h4 className="profile-success__title">Password Updated</h4>
                    <p className="profile-success__text">
                        Password changed successfully!
                    </p>

                    <div className="profile-alert profile-alert--info">
                        <SecurityNoteIcon />
                        <div>
                            <p className="profile-alert__title">Security Note</p>
                            <p>For security purposes, you'll need to log in again with your new password on your next session.</p>
                        </div>
                    </div>

                </div>
            </div>

            <div className="profile-modal__footer profile-modal__footer--center">
                <div className="profile-modal__actions">
                    <button type="button" className="profile-action profile-action--primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </section>
    );
}