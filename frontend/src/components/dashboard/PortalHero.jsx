function BrowseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
    );
}

function InfoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
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