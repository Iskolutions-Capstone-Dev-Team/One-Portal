import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { completeAuthorization } from "../services/auth";

export default function Callback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        const finishAuthorization = async () => {
            const identityProviderError = searchParams.get("error");
            const identityProviderMessage = searchParams.get("error_description");
            const code = searchParams.get("code");

            if (identityProviderError) {
                if (isMounted) {
                    setErrorMessage(identityProviderMessage || identityProviderError);
                }

                return;
            }

            if (!code) {
                if (isMounted) {
                    setErrorMessage("The callback is missing the authorization code.");
                }

                return;
            }

            try {
                await completeAuthorization(code);

                if (isMounted) {
                    navigate("/portal", { replace: true });
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error.message);
                }
            }
        };

        finishAuthorization();

        return () => {
            isMounted = false;
        };
    }, [navigate, searchParams]);

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
                <img src="/assets/images/PUPlogo.png" alt="PUP Logo" className="float-logo w-28 sm:w-32"/>

                <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/75 sm:text-sm">
                    Signing You In
                </p>

                {errorMessage ? (
                    <p className="max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                        {errorMessage}
                    </p>
                ) : null}

                {errorMessage && (
                    <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f8d24e] px-6 py-3 text-sm font-semibold text-[#5c0b10] shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ffe27a]">
                        Return to home page
                    </Link>
                )}
            </div>
        </div>
    );
}