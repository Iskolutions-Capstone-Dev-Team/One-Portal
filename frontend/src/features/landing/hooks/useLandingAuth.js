import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { startAuthorization } from '../../../services/auth';

export function useLandingAuth() {
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

    const loginMutation = useMutation({
        mutationFn: startAuthorization,
        onMutate: () => {
            setAuthError("");
        },
        onError: (error) => {
            console.error("Unable to start authorization.", error);
            if (error.message?.includes("Too many attempts") || error?.includes?.("Too many attempts")) {
                setAuthError("Too many attempts. Please wait.");
                setCooldown(12);
            } else {
                setAuthError("Unable to start authorization. Please try again.");
            }
        }
    });

    return {
        loginMutation,
        authError,
        cooldown,
        setAuthError
    };
}
