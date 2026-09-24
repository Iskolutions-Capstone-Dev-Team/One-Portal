import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

    const queryClient = useQueryClient();

    const { data: authenticators = [], error, isLoading } = useQuery({
        queryKey: ["authenticators", email],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return getAuthenticators(email);
        },
        enabled: !isProfileLoading && !!email,
        retry: false,
        refetchOnWindowFocus: false,
    });

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

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteAuthenticator({ email, id }),
        onSuccess: () => {
            toast.success("Authenticator removed successfully!");
            setPendingDeleteAuthenticator(null);
            queryClient.invalidateQueries({ queryKey: ["authenticators", email] });
        },
        onError: (error) => {
            if (error?.status === 429 || error?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage(`Too many attempts. Please wait.`);
            } else {
                setErrorMessage(error.message || "Failed to remove authenticator.");
            }
        }
    });

    const handleConfirmDelete = () => {
        if (!pendingDeleteAuthenticator) return;
        setErrorMessage("");
        deleteMutation.mutate(pendingDeleteAuthenticator.id);
    };

    const handleSaved = () => {
        queryClient.invalidateQueries({ queryKey: ["authenticators", email] });
    };

    return {
        authenticators,
        isModalOpen,
        setModalOpen,
        currentSlide,
        isLoading,
        deletingId: deleteMutation.isPending ? pendingDeleteAuthenticator?.id : null,
        pendingDeleteAuthenticator,
        errorMessage,
        cooldown,
        handleDeleteClick,
        handleCancelDelete,
        handleConfirmDelete,
        handleSaved
    };
}
