export default function SystemCard({ system }) {
    const cardImage = system.imageClear || system.imageBlur;

    return (
        <article className="system-card">
            <figure className="system-card-media">
                <img src={cardImage} alt={system.title} className="system-card-image" />
                <div className="system-card-tint" aria-hidden="true" />
                <div className="system-card-glow" aria-hidden="true" />
                <img src="/assets/images/PUPlogo.png" alt="" aria-hidden="true" className="system-card-logo"/>
            </figure>

            <div className="system-card__body">
                <h2 className="system-card__title">{system.title}</h2>
                <p className="system-card__description">{system.description}</p>
                <div className="system-card__actions">
                    <a href={system.link} className="system-card__button">
                        Access
                    </a>
                </div>
            </div>
        </article>
    );
}