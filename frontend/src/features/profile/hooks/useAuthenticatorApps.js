import { useCallback, useEffect, useState } from "react";
import { deleteAuthenticator, getAuthenticators } from "../../../services/userMfa";
import { toast } from "sonner";

export function useAuthenticatorApps({ email, isProfileLoading }) {
    const [authenticators, setAuthenticators] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [pendingDeleteAuthenticator, setPendingDeleteAuthenticator] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const loadAuthenticators = useCallback(async () => {
        if (isProfileLoading) {
            setAuthenticators([]);
            setIsLoading(true);
            setErrorMessage("");
            return;
        }

        if (!email) {
            setAuthenticators([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
            const authenticatorList = await getAuthenticators(email);
            setAuthenticators(authenticatorList);
        } catch (error) {
            setErrorMessage(error.message || "Failed to load authenticators.");
        } finally {
            setIsLoading(false);
        }
    }, [email, isProfileLoading]);

    useEffect(() => {
        void loadAuthenticators();
    }, [loadAuthenticators]);

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
            await loadAuthenticators();
            toast.success("Authenticator removed successfully!");
            setPendingDeleteAuthenticator(null);
        } catch (error) {
            setErrorMessage(error.message || "Failed to remove authenticator.");
        } finally {
            setDeletingId("");
        }
    };

    const handleSaved = async () => {
        await loadAuthenticators();
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
        handleDeleteClick,
        handleCancelDelete,
        handleConfirmDelete,
        handleSaved
    };
}
