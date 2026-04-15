import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { completeAuthorization, startAuthorization } from "../services/auth";

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
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2b0307]/90 via-[#7b0d15]/80 to-[#180204]/90" />
                <div className="absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full bg-[#f8d24e]/20 blur-3xl" />
                <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
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
