export default function SystemCard({ system }) {
    const fallbackBackgroundImage = "/assets/images/system_card_clear.png";
    const fallbackLogoImage = "/assets/images/PUPlogo.png";
    const cardImage = system.imageClear || system.imageBlur || fallbackBackgroundImage;
    const cardLogo = system.logo?.trim() || fallbackLogoImage;
    const accessLink = system.link?.trim() || "";
    const isAccessDisabled = !accessLink;

    return (
        <article className="system-card">
            <figure className="system-card-media">
                <img src={cardImage} alt={system.title} className="system-card-image"
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackBackgroundImage;
                    }}
                />
                <div className="system-card-tint" aria-hidden="true" />
                <div className="system-card-glow" aria-hidden="true" />
                <img src={cardLogo} alt={`${system.title} logo`} className="system-card-logo"
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackLogoImage;
                    }}
                />
            </figure>

            <div className="system-card__body">
                <h2 className="system-card__title">{system.title}</h2>
                {system.description ? (
                    <p className="system-card__description">{system.description}</p>
                ) : null}
                <div className="system-card__actions">
                    <a href={accessLink || undefined} className={`system-card__button ${isAccessDisabled ? "is-disabled" : ""}`} target={isAccessDisabled ? undefined : "_blank"} rel={isAccessDisabled ? undefined : "noreferrer"} aria-disabled={isAccessDisabled}
                        onClick={(event) => {
                            if (isAccessDisabled) {
                                event.preventDefault();
                            }
                        }}
                    >
                        {isAccessDisabled ? "Unavailable" : "Access"}
                    </a>
                </div>
            </div>
        </article>
    );
}