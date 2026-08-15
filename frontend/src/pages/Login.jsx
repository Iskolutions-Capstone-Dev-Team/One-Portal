import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { completeAuthorization, startAuthorization } from "../services/auth";
import DotField from "../components/ui/DotField";

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [hasAuthorizationError, setHasAuthorizationError] = useState(false);

    const identityProviderError = searchParams.get("error");
    const code = searchParams.get("code");

    useEffect(() => {
        let isMounted = true;

        const handleLoginFlow = async () => {
            if (identityProviderError) {
                if (isMounted) {
                    setHasAuthorizationError(true);
                }

                return;
            }

            if (code) {
                try {
                    await completeAuthorization(code);

                    if (isMounted) {
                        navigate("/portal", { replace: true });
                    }
                } catch (error) {
                    if (isMounted) {
                        setHasAuthorizationError(true);
                    }
                }

                return;
            }

            if (isMounted) {
                setHasAuthorizationError(false);
            }

            try {
                await startAuthorization();
            } catch (error) {
                if (isMounted) {
                    setHasAuthorizationError(true);
                }
            }
        };

        void handleLoginFlow();

        return () => {
            isMounted = false;
        };
    }, [code, identityProviderError, navigate]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#250508] font-[Poppins] text-white">
            <div 
                className="fixed inset-0 z-0"
                style={{ 
                    background: 'radial-gradient(circle at 12% 14%, rgba(145, 31, 42, 0.5), transparent 30rem), radial-gradient(circle at 84% 20%, rgba(248, 210, 78, 0.08), transparent 26rem), linear-gradient(135deg, #1c0306 0%, #4f0d17 48%, #230407 100%)' 
                }}
            >
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
            </div>

            <div className="relative flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
                <img src="/assets/images/PUPlogo.png" alt="PUP Logo" className="float-logo w-28 sm:w-32" />

                {hasAuthorizationError && (
                    <Link
                        to="/"
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f8d24e] px-6 py-3 text-sm font-semibold text-[#5c0b10] shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ffe27a]"
                    >
                        Return to home page
                    </Link>
                )}
            </div>
        </div>
    );
}
