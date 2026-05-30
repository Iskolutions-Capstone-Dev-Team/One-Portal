function BrowseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
        </svg>
    );
}

function InfoIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
        </svg>
    );
}

export default function PortalHero({ children }) {
    return (
        <section className="header">
            <div className="header-background">
                <img src="/assets/images/pup_bg.png" alt="Header Background" className="header-bg-img" />
                <div className="header-backdrop" aria-hidden="true" />

                <div className="header-content">
                    <div className="header-content__shell">
                        <div className="header-logos">
                            <img src="/assets/images/PUPlogo.png" alt="PUP Taguig Seal" className="header-seal-img" />
                        </div>

                        <h1 className="header-title">PUP Taguig One Portal</h1>
                        <p className="header-subtitle">
                            The PUP Online Repository of all systems for PUP Taguig students, faculty, and staff.
                        </p>
                        <div className="header-actions" aria-label="Portal shortcuts">
                            <a href="#portal-systems" className="header-action-button header-action-button--primary">
                                <span className="header-action-icon" aria-hidden="true">
                                    <BrowseIcon />
                                </span>
                                Explore Services
                            </a>
                            <a href="#portal-footer" className="header-action-button header-action-button--secondary">
                                <span className="header-action-icon" aria-hidden="true">
                                    <InfoIcon />
                                </span>
                                Learn More
                            </a>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}