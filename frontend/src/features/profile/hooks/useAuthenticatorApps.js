import { useEffect, useState } from "react";
import useSWR from "swr";
import { deleteAuthenticator, getAuthenticators } from "../../../services/userMfa";
import { toast } from "sonner";

export function useAuthenticatorApps({ email, isProfileLoading }) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [deletingId, setDeletingId] = useState("");
    const [pendingDeleteAuthenticator, setPendingDeleteAuthenticator] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [cooldown, setCooldown] = useState(0);



    useEffect(() => {
        let intervalId;
        if (cooldown > 0) {
            intervalId = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [cooldown]);

    useEffect(() => {
        if (cooldown === 0) {
            setErrorMessage((prev) => prev.startsWith("Too many attempts") ? "" : prev);
        }
    }, [cooldown]);

    const fetcher = async (key) => {
        const [, userEmail] = key;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return getAuthenticators(userEmail);
    };

    const { data: authenticators = [], error, isLoading, mutate } = useSWR(
        !isProfileLoading && email ? ["authenticators", email] : null,
        fetcher,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            revalidateIfStale: false
        }
    );

    useEffect(() => {
        if (error) {
            if (error?.status === 429 || error?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage("Too many attempts. Please wait.");
            } else {
                setErrorMessage(error.message || "Failed to load authenticators.");
            }
        }
    }, [error]);

    useEffect(() => {
        setCurrentSlide(0);
    }, [authenticators.length]);

    const handleDeleteClick = (authenticator) => {
        setPendingDeleteAuthenticator(authenticator);
        setErrorMessage("");
    };

    const handleCancelDelete = () => {
        if (deletingId) {
            return;
        }

        setPendingDeleteAuthenticator(null);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteAuthenticator) {
            return;
        }

        setDeletingId(pendingDeleteAuthenticator.id);
        setErrorMessage("");

        try {
            await deleteAuthenticator({ email, id: pendingDeleteAuthenticator.id });
            await mutate();
            toast.success("Authenticator removed successfully!");
            setPendingDeleteAuthenticator(null);
        } catch (error) {
            if (error?.status === 429 || error?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage(`Too many attempts. Please wait.`);
            } else {
                setErrorMessage(error.message || "Failed to remove authenticator.");
            }
        } finally {
            setDeletingId("");
        }
    };

    const handleSaved = async () => {
        await mutate();
    };

    return {
        authenticators,
        isModalOpen,
        setModalOpen,
        currentSlide,
        isLoading,
        deletingId,
        pendingDeleteAuthenticator,
        errorMessage,
        cooldown,
        handleDeleteClick,
        handleCancelDelete,
        handleConfirmDelete,
        handleSaved
    };
}
