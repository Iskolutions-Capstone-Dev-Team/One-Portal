import { CalendarIcon, CampusIcon, GraduateIcon, HomeBadgeIcon, PeopleIcon, RegisterIcon } from "./LandingIcons";

function FloatingIcon({ children, className }) {
    return (
        <div className={`landing-floating-icon ${className}`} aria-hidden="true">
            {children}
        </div>
    );
}

function AccessPreviewCard() {
    return (
        <a href="#" className="landing-hover-3d" aria-label="PUP Taguig One Portal access preview" onClick={(event) => event.preventDefault()}>
            <div className="landing-access-card">
                <img src="/assets/images/pup_bg.png" alt="" className="landing-access-card__background" />
                <div className="landing-access-card__overlay" />

                <div className="landing-access-card__content">
                    <img src="/assets/images/PUPlogo.png" alt="" className="landing-access-card__logo" />
                    <p>PUP TAGUIG</p>
                    <span>ONE PORTAL</span>
                </div>
            </div>

            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} aria-hidden="true" />
            ))}
        </a>
    );
}

export default function HeroSection({ pendingAction, onRegisterClick }) {
    return (
        <section id="home" className="auth-entry__content">
            <FloatingIcon className="landing-floating-icon--graduate">
                <GraduateIcon />
            </FloatingIcon>
            <FloatingIcon className="landing-floating-icon--campus">
                <CampusIcon />
            </FloatingIcon>
            <FloatingIcon className="landing-floating-icon--calendar">
                <CalendarIcon />
            </FloatingIcon>
            <FloatingIcon className="landing-floating-icon--people">
                <PeopleIcon />
            </FloatingIcon>

            <div className="landing-hero__copy landing-reveal">
                <div className="landing-hero__badge">
                    <HomeBadgeIcon />
                    <span>Home</span>
                </div>
                <h1 className="auth-entry__title">
                    Access <span className="auth-entry__title-accent auth-entry__title-accent--inline">PUPT</span> Services.
                </h1>
                <p className="auth-entry__description">One starting point for campus services.</p>

                <div className="auth-entry__actions">
                    <button type="button" className="auth-entry__button auth-entry__button--outline" onClick={onRegisterClick} disabled={Boolean(pendingAction)}>
                        <span className="auth-entry__button-icon" aria-hidden="true">
                            <RegisterIcon />
                        </span>
                        <span>{pendingAction === "register" ? "Opening..." : "Register"}</span>
                    </button>
                </div>
            </div>

            <div className="landing-access-card-wrap landing-reveal landing-reveal--delay-1">
                <AccessPreviewCard />
            </div>
        </section>
    );
}