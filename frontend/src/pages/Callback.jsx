import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import { completeAuthorization } from "../services/auth";

export default function Callback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [errorMessage, setErrorMessage] = useState("");
    const identityProviderError = searchParams.get("error");
    const identityProviderMessage = searchParams.get("error_description");
    const code = searchParams.get("code");

    useEffect(() => {
        let isMounted = true;

        const finishAuthorization = async () => {
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
    }, [code, identityProviderError, identityProviderMessage, navigate]);

    return (
        <AuthLoadingScreen
            message={errorMessage ? "Sign In Failed" : "Signing You In"}
            errorMessage={errorMessage}
            action={
                errorMessage ? (
                    <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f8d24e] px-6 py-3 text-sm font-semibold text-[#5c0b10] shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ffe27a]">
                        Return to home page
                    </Link>
                ) : null
            }
        />
    );
}