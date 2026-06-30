import { BrowseIcon, InfoIcon } from "./portalIcons";

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