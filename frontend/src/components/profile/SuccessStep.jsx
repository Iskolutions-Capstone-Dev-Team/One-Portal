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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h4 className="profile-success__title">Password Updated</h4>
                    <p className="profile-success__text">
                        Password changed successfully!
                    </p>

                    <div className="profile-alert profile-alert--info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="profile-alert__title">Security Note</p>
                            <p>For security purposes, you'll need to log in again with your new password on your next session.</p>
                        </div>
                    </div>

                    <div className="profile-success__activity">
                        <h5 className="profile-success__activity-title">Security Activity Logged</h5>
                        <div className="profile-success__activity-card">
                            <div>
                                <p className="profile-success__activity-label">Password Change</p>
                                <p className="profile-success__activity-time">Just now</p>
                            </div>
                            <span className="profile-success__activity-badge">Completed</span>
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