export default function EmailStatus() {
    return (
        <section className="profile-status" aria-label="Email status">
            <div className="profile-status__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>

            <div className="profile-status__copy">
                <h4 className="profile-status__title">Email Status</h4>
                <p className="profile-status__text">Current email delivery status</p>
            </div>

            <div className="profile-status__badge">
                <span className="profile-status__pulse" aria-hidden="true" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Email Active</span>
            </div>
        </section>
    );
}