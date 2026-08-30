import { useState, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { getDevices, deleteDevice, updateDevice } from "../../../services/userDevices";

export function useRememberedDevices({ isProfileLoading }) {
    const [errorMessage, setErrorMessage] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [isRenameModalOpen, setRenameModalOpen] = useState(false);
    const [pendingRenameDevice, setPendingRenameDevice] = useState(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [pendingDeleteDevice, setPendingDeleteDevice] = useState(null);

    const fetcher = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return getDevices();
    };

    const { data: devices = [], error, isLoading, mutate } = useSWR(
        !isProfileLoading ? "trusted_devices" : null,
        fetcher,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            revalidateIfStale: false
        }
    );

    useEffect(() => {
        if (error) {
            if (error?.status === 401 || error?.response?.status === 401) {
                // Ignore 401, parent handles it
                return;
            }
            if (error?.status === 429 || error?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage("Too many attempts. Please wait.");
            } else {
                setErrorMessage(error.message || "Failed to load trusted devices.");
            }
        }
    }, [error]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleRenameClick = (device) => {
        setPendingRenameDevice(device);
        setRenameModalOpen(true);
    };

    const handleRenameSave = async (newName) => {
        if (!pendingRenameDevice) return;
        setIsRenaming(true);
        setErrorMessage("");
        try {
            await updateDevice({ id: pendingRenameDevice.id, name: newName });
            toast.success("Device renamed successfully.");
            setRenameModalOpen(false);
            setPendingRenameDevice(null);
            await mutate();
        } catch (error) {
            if (error?.status === 429 || error?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage("Too many attempts. Please wait.");
            } else {
                setErrorMessage(error.message || "Failed to rename device.");
            }
        } finally {
            setIsRenaming(false);
        }
    };

    const handleRenameCancel = () => {
        setRenameModalOpen(false);
        setPendingRenameDevice(null);
    };

    const handleDeleteClick = (device) => {
        setPendingDeleteDevice(device);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteDevice) return;
        
        setDeletingId(pendingDeleteDevice.id);
        setErrorMessage("");
        
        try {
            await deleteDevice({ id: pendingDeleteDevice.id });
            toast.success("Device removed successfully.");
            setPendingDeleteDevice(null);
            await mutate();
        } catch (error) {
            if (error?.status === 429 || error?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage("Too many attempts. Please wait.");
            } else {
                setErrorMessage(error.message || "Failed to remove device.");
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleCancelDelete = () => {
        setPendingDeleteDevice(null);
    };

    return {
        devices,
        isLoading,
        errorMessage,
        cooldown,
        isRenameModalOpen,
        pendingRenameDevice,
        isRenaming,
        handleRenameClick,
        handleRenameSave,
        handleRenameCancel,
        deletingId,
        pendingDeleteDevice,
        handleDeleteClick,
        handleConfirmDelete,
        handleCancelDelete,
    };
}
