import { ShieldCheckIcon, CheckMarkIcon } from "./profileIcons";

export default function EmailStatus() {
    return (
        <section className="profile-status" aria-label="Email status">
            <div className="profile-status__icon" aria-hidden="true">
                <ShieldCheckIcon />
            </div>

            <div className="profile-status__copy">
                <h4 className="profile-status__title">Email Status</h4>
                <p className="profile-status__text">Current email delivery status</p>
            </div>

            <div className="profile-status__badge">
                <span className="profile-status__pulse" aria-hidden="true" />
                <CheckMarkIcon />
                <span>Email Active</span>
            </div>
        </section>
    );
}