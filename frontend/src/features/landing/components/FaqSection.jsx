import { FaqBadgeIcon } from "./LandingIcons";
import { faqItems } from "../constants/landingContent";

export default function FaqSection({ openFaqIndex, onToggleFaq }) {
    return (
        <section id="faq" className="landing-section landing-section--faq">
            <div className="landing-section__badge landing-reveal">
                <FaqBadgeIcon />
                <span>Frequently Asked Questions</span>
            </div>
            <h2 className="landing-reveal landing-reveal--delay-1">Common Questions</h2>
            <p className="landing-section__intro landing-reveal landing-reveal--delay-2">
                Here are answers to common questions before using One Portal.
            </p>

            <div className="landing-faq landing-reveal landing-reveal--delay-3">
                <div className="landing-faq__list">
                    {faqItems.map((item, index) => {
                        const isOpen = openFaqIndex === index;
                        const itemClassName = [
                            "landing-faq__item",
                            isOpen ? "landing-faq__item--open" : "",
                        ]
                            .filter(Boolean)
                            .join(" ");

                        return (
                            <div key={item.question} className={itemClassName}>
                                <button type="button" className="landing-faq__title" aria-expanded={isOpen} onClick={() => onToggleFaq(index)}>
                                    {item.question}
                                </button>
                                <div className="landing-faq__content" aria-hidden={!isOpen}>
                                    {item.answer}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
