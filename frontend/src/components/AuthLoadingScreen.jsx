import { useEffect } from "react";
import { authPageBackground } from "../utils/authBackground";
import DotField from "@/components/ui/DotField";
import RippleSpinner from "@/components/ui/RippleSpinner";

export default function AuthLoadingScreen({ message, errorMessage = "", action = null, isFixed = false }) {
    const screenPosition = isFixed ? "fixed inset-0 z-[9999]" : "relative min-h-screen";
    const isLoading = !errorMessage;

    useEffect(() => {
        document.documentElement.classList.remove("dark");
    }, []);

    return (
        <div className={`${screenPosition} overflow-hidden font-[Poppins] text-white`} style={{ background: authPageBackground }}>
            <div className="absolute inset-0 overflow-hidden">
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

            <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
                <div className="relative flex h-44 w-44 items-center justify-center sm:h-48 sm:w-48">
                    {isLoading ? (
                        <RippleSpinner size="xl" className="absolute inset-0 text-[#ffd21a]" />
                    ) : null}
                    <img src="/assets/images/PUPlogo.png" alt="PUP Logo" className="relative z-10 w-24 sm:w-28" />
                </div>

                <p className="mt-7 text-xs font-medium uppercase tracking-[0.28em] text-white/85 sm:text-sm">
                    {message}
                </p>

                {errorMessage ? (
                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                        {errorMessage}
                    </p>
                ) : (
                    <span className="loading loading-dots loading-md mt-3 text-[#ffd21a]" aria-label="Loading" />
                )}

                {action ? <div className="mt-6">{action}</div> : null}
            </div>
        </div>
    );
}