import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FaqSection from "../components/landing/FaqSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import HeroSection from "../components/landing/HeroSection";
import LandingNavbar from "../components/landing/LandingNavbar";
import { navigateToRegisterPage, startAuthorization } from "../services/auth";
import { getCurrentUserProfile } from "../services/userProfile";
import "../styles/AuthEntry.css";

function useLandingReveal() {
    useEffect(() => {
        const revealElements = document.querySelectorAll(".landing-reveal");

        if (!("IntersectionObserver" in window)) {
            revealElements.forEach((element) => element.classList.add("landing-reveal--visible"));
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle("landing-reveal--visible", entry.isIntersecting);
                });
            },
            {
                rootMargin: "0px 0px -8% 0px",
                threshold: 0.18,
            },
        );

        revealElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);
}

export default function Landing() {
    const navigate = useNavigate();
    const [pendingAction, setPendingAction] = useState("");
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    useLandingReveal();

    const handleLoginClick = async () => {
        setPendingAction("login");

        try {
            await getCurrentUserProfile();
            navigate("/portal", { replace: true });
        } catch {
            try {
                await startAuthorization();
            } catch (authorizationError) {
                console.error("Unable to start authorization.", authorizationError);
                setPendingAction("");
            }
        }
    };

    const handleRegisterClick = () => {
        setPendingAction("register");
        navigateToRegisterPage();
    };

    const handleFaqToggle = (index) => {
        setOpenFaqIndex((currentIndex) => (currentIndex === index ? null : index));
    };

    return (
        <div className="auth-entry auth-entry--landing">
            <div className="landing-pattern" aria-hidden="true" />

            <div className="auth-entry__shell">
                <LandingNavbar pendingAction={pendingAction} onLoginClick={handleLoginClick} />

                <main>
                    <HeroSection pendingAction={pendingAction} onRegisterClick={handleRegisterClick} />
                    <FeaturesSection />
                    <FaqSection openFaqIndex={openFaqIndex} onToggleFaq={handleFaqToggle} />
                </main>
            </div>
        </div>
    );
}