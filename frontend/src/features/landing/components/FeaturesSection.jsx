import { StarBadgeIcon } from "./landingIcons";
import { featureItems } from "../constants/landingContent";

function FeatureCard({ item }) {
    const Icon = item.icon;

    return (
        <article className="landing-feature-card">
            <div className="landing-feature-card__icon" aria-hidden="true">
                <Icon />
            </div>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
        </article>
    );
}

export default function FeaturesSection() {
    return (
        <section id="features" className="landing-section landing-section--features">
            <div className="landing-section__badge landing-reveal">
                <StarBadgeIcon />
                <span>Features</span>
            </div>
            <h2 className="landing-reveal landing-reveal--delay-1">Access Campus Services Faster</h2>
            <p className="landing-section__intro landing-reveal landing-reveal--delay-2">
                One Portal keeps essential PUPT tools organized and easy to reach.
            </p>

            <div className="landing-feature-grid">
                {featureItems.map((item, index) => (
                    <div key={item.title} className={`landing-reveal landing-reveal--delay-${Math.min(index + 1, 3)}`}>
                        <FeatureCard item={item} />
                    </div>
                ))}
            </div>
        </section>
    );
}
