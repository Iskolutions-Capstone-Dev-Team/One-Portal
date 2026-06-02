function getSystemCode(system) {
    if (system.code || system.shortName) {
        return system.code || system.shortName;
    }

    return system.title
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 3);
}

function ArrowIcon() {
    return (
        <svg className="system-card__button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M2 10a.75.75 0 0 1 .75-.75h12.59l-2.1-1.95a.75.75 0 1 1 1.02-1.1l3.5 3.25a.75.75 0 0 1 0 1.1l-3.5 3.25a.75.75 0 1 1-1.02-1.1l2.1-1.95H2.75A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
        </svg>
    );
}

export default function SystemCard({ system }) {
    const fallbackBackgroundImage = "/assets/images/system_card_clear.png";
    const fallbackLogoImage = "/assets/images/PUPlogo.png";
    const cardImage = system.imageClear || system.imageBlur || fallbackBackgroundImage;
    const cardLogo = system.logo?.trim() || fallbackLogoImage;
    const accessLink = system.link?.trim() || "";
    const isAccessDisabled = !accessLink;
    const systemCode = getSystemCode(system);

    return (
        <article className="system-card">
            <img src={cardImage} alt="" className="system-card-image"
                onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackBackgroundImage;
                }}
            />
            <div className="system-card-tint" aria-hidden="true" />
            <div className="system-card-glow" aria-hidden="true" />

            <div className="system-card__content">
                <img src={cardLogo} alt={`${system.title} logo`} className="system-card-logo"
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackLogoImage;
                    }}
                />

                <span className="system-card__code">{systemCode}</span>

                <div className="system-card__copy">
                    <h2 className="system-card__title">{system.title}</h2>
                    {system.description ? (
                        <p className="system-card__description">{system.description}</p>
                    ) : null}
                </div>

                <div className="system-card__actions">
                    <a href={accessLink || undefined} className={`system-card__button ${isAccessDisabled ? "is-disabled" : ""}`} target={isAccessDisabled ? undefined : "_blank"} rel={isAccessDisabled ? undefined : "noreferrer"} aria-disabled={isAccessDisabled} aria-label={isAccessDisabled ? `${system.title} unavailable` : `Access ${system.title}`}
                        onClick={(event) => {
                            if (isAccessDisabled) {
                                event.preventDefault();
                            }
                        }}
                    >
                        <span className="sr-only">{isAccessDisabled ? "Unavailable" : "Access"}</span>
                        <ArrowIcon />
                    </a>
                </div>
            </div>
        </article>
    );
}