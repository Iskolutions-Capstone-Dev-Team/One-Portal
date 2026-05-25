import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import { completeAuthorization } from "../services/auth";

export default function Callback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [errorMessage, setErrorMessage] = useState("");
    const hasRun = useRef(false);
    const identityProviderError = searchParams.get("error");
    const identityProviderMessage = searchParams.get("error_description");
    const code = searchParams.get("code");

    useEffect(() => {
        if (hasRun.current) return undefined;
        hasRun.current = true;

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
            message="Signing You In"
            errorMessage={errorMessage}
            actionLabel={errorMessage ? "Return to home page" : ""}
        />
    );
}
