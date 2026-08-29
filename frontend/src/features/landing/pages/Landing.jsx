import { useEffect, useState } from "react";
import FaqSection from "../components/FaqSection";
import FeaturesSection from "../components/FeaturesSection";
import HeroSection from "../components/HeroSection";
import LandingNavbar from "../components/LandingNavbar";
import { startAuthorization, getRegisterPageUrl } from "../../../services/auth";
import DotField from "../../../components/ui/DotField";
import { Alert, AlertDescription } from "../../../components/reui/alert";
import { CircleAlertIcon } from "lucide-react";

function navigateToRegisterPage() {
    window.location.href = getRegisterPageUrl();
}

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
    const [pendingAction, setPendingAction] = useState("");
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [authError, setAuthError] = useState("");
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let intervalId;
        if (cooldown > 0) {
            intervalId = setInterval(() => setCooldown((prev) => prev - 1), 1000);
        } else if (authError === "Too many attempts. Please wait.") {
            setAuthError("");
        }
        return () => clearInterval(intervalId);
    }, [cooldown, authError]);

    useLandingReveal();

    const handleLoginClick = async () => {
        setPendingAction("login");
        setAuthError("");

        try {
            await startAuthorization();
        } catch (authorizationError) {
            console.error("Unable to start authorization.", authorizationError);
            if (authorizationError.message.includes("Too many attempts")) {
                setAuthError("Too many attempts. Please wait.");
                setCooldown(12);
            } else {
                setAuthError("Unable to start authorization. Please try again.");
            }
            setPendingAction("");
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
        <div className="relative min-h-screen overflow-y-auto text-orange-50 font-[Poppins] bg-gradient-to-br from-[#1c0306] via-[#4f0d17] to-[#230407]">
            {/* Background Pattern Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <DotField
                    dotRadius={1.5}
                    dotSpacing={14}
                    bulgeStrength={67}
                    glowRadius={160}
                    sparkle={false}
                    waveAmplitude={0}
                    cursorRadius={500}
                    cursorForce={0.1}
                    bulgeOnly
                    gradientFrom="rgba(255, 255, 255, 0.22)"
                    gradientTo="rgba(255, 255, 255, 0.08)"
                    glowColor="rgba(0, 0, 0, 0.2)"
                />
            </div>

            <div className="relative z-10 w-full max-w-[1280px] mx-auto pb-10">
                <LandingNavbar pendingAction={pendingAction} cooldown={cooldown} onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />

                <main className="relative z-10">
                    {authError && (
                        <div className="mx-auto max-w-md px-5 mt-4 md:mt-8 mb-[-1rem] relative z-50">
                            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 [&>svg]:text-red-600 shadow-sm flex items-center gap-2 py-3">
                                <CircleAlertIcon className="h-5 w-5" />
                                <AlertDescription className="text-red-800 font-medium">
                                    {cooldown > 0 ? `${authError} (${cooldown}s)` : authError}
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                    <HeroSection pendingAction={pendingAction} cooldown={cooldown} onRegisterClick={handleRegisterClick} />
                    <FeaturesSection />
                    <FaqSection />
                </main>
            </div>
        </div>
    );
}
