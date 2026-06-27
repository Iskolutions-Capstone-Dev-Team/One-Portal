import { ArrowIcon } from "./portalIcons";

export default function SystemCard({ system }) {
    const fallbackBackgroundImage = "/assets/images/system_card_clear.png";
    const fallbackLogoImage = "/assets/images/PUPlogo.png";
    const cardImage = system.imageClear || system.imageBlur || fallbackBackgroundImage;
    const cardLogo = system.logo?.trim() || fallbackLogoImage;
    const accessLink = system.link?.trim() || "";
    const isAccessDisabled = !accessLink;
    const systemName = system.title?.trim() || "Untitled system";
    const description = typeof system.description === "string"
        ? system.description.trim()
        : "";
    const hasDescription = Boolean(description);

    return (
        <article className={`system-card ${hasDescription ? "has-description" : ""}`}>
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

                <span className="system-card__code">{systemName}</span>

                <div className="system-card__copy">
                    <h2 className="system-card__title">{system.title}</h2>
                    {hasDescription ? (
                        <p className="system-card__description">{description}</p>
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
                        <span>{isAccessDisabled ? "Unavailable" : "Access"}</span>
                        <ArrowIcon />
                    </a>
                </div>
            </div>
        </article>
    );
}