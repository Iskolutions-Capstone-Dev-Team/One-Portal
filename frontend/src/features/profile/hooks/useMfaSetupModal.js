import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import QRCode from "qrcode";
import { beginPasskeyRegistration, finishPasskeyRegistration, getMfaSetup, saveAuthenticator } from "../../../services/userMfa";
import { createPasskeyCredential } from "../../../utils/webAuthn";
import { toast } from "sonner";

const EMPTY_CODE = ["", "", "", "", "", ""];

export function useMfaSetupModal({ isOpen, email, onClose, onSaved }) {
    const [step, setStep] = useState("choice");
    const [setup, setSetup] = useState({ secret: "", otpauthUri: "" });
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [authenticatorName, setAuthenticatorName] = useState("");
    const [code, setCode] = useState(EMPTY_CODE);
    const [backupCodes, setBackupCodes] = useState([]);
    const [hasCopiedBackupCodes, setHasCopiedBackupCodes] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
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

    useEffect(() => {
        if (!isOpen) {
            setStep("choice");
            setSetup({ secret: "", otpauthUri: "" });
            setQrCodeUrl("");
            setAuthenticatorName("");
            setCode(EMPTY_CODE);
            setBackupCodes([]);
            setHasCopiedBackupCodes(false);
            setErrorMessage("");
            setIsSaving(false);
            setIsRegisteringPasskey(false);
        }
    }, [isOpen]);

    const { data: setupData, error: loadError, isLoading: isLoadingSetup } = useQuery({
        queryKey: ['mfaSetup', email],
        queryFn: async () => {
            const data = await getMfaSetup(email);
            const qrUrl = await QRCode.toDataURL(data.otpauthUri, {
                width: 320,
                margin: 1,
                color: { dark: "#000000", light: "#ffffff" },
            });
            return { setup: data, qrCodeUrl: qrUrl };
        },
        enabled: isOpen && step === "scan" && !!email,
        retry: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (setupData) {
            setSetup(setupData.setup);
            setQrCodeUrl(setupData.qrCodeUrl);
        }
    }, [setupData]);

    useEffect(() => {
        if (loadError) {
            if (loadError?.status === 429 || loadError?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage(`Too many attempts. Please wait.`);
                setStep("choice");
            } else {
                setErrorMessage(loadError.message || "Failed to prepare MFA setup.");
            }
        }
    }, [loadError]);

    const saveAuthenticatorMutation = useMutation({
        mutationFn: (data) => saveAuthenticator(data),
        onSuccess: async (result) => {
            setBackupCodes(result.backupCodes);
            setHasCopiedBackupCodes(false);
            setStep("backupCodes");

            if (!result.backupCodes.length) {
                await onSaved?.();
                onClose();
            }
        },
        onError: (error) => {
            setErrorMessage(error.message || "Failed to save authenticator.");
        }
    });

    const handleSave = () => {
        const submittedCode = code.join("");
        const name = authenticatorName.trim();

        if (!name) {
            setErrorMessage("Enter an authenticator name.");
            return;
        }

        if (name.length > 255) {
            setErrorMessage("Authenticator name cannot exceed 255 characters.");
            return;
        }

        if (submittedCode.length !== 6) {
            setErrorMessage("Enter the complete 6-digit authenticator code.");
            return;
        }

        setErrorMessage("");

        saveAuthenticatorMutation.mutate({
            email,
            secret: setup.secret,
            code: submittedCode,
            name,
        });
    };

    const handleCopyBackupCodes = async () => {
        const backupCodesText = backupCodes.join("\\n");

        if (!backupCodesText) {
            return;
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(backupCodesText);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = backupCodesText;
                textArea.setAttribute("readonly", "");
                textArea.style.position = "fixed";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }

            setHasCopiedBackupCodes(true);
            setErrorMessage("");
            toast.success("Backup codes copied to clipboard");
        } catch (error) {
            setErrorMessage(error.message || "Unable to copy backup codes.");
        }
    };

    const handleFinish = async () => {
        await onSaved?.();
        toast.success("Authenticator App connected successfully!");
        onClose();
    };

    const handleClose = async () => {
        if (step === "backupCodes") {
            await onSaved?.();
        }

        onClose();
    };

    const handleSelectAuthenticatorApp = () => {
        setErrorMessage("");
        setStep("scan");
    };

    const passkeyMutation = useMutation({
        mutationFn: async () => {
            const options = await beginPasskeyRegistration(email);
            const credential = await createPasskeyCredential(options);
            await finishPasskeyRegistration(email, credential);
        },
        onSuccess: async () => {
            await onSaved?.();
            toast.success("Passkey connected successfully!");
            onClose();
        },
        onError: (error) => {
            if (error?.status === 429 || error?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage(`Too many attempts. Please wait.`);
            } else {
                setErrorMessage(error.message || "Failed to register passkey.");
            }
        }
    });

    const handleSelectPasskey = () => {
        setErrorMessage("");
        passkeyMutation.mutate();
    };

    return {
        step,
        setStep,
        setup,
        qrCodeUrl,
        authenticatorName,
        setAuthenticatorName,
        code,
        setCode,
        backupCodes,
        hasCopiedBackupCodes,
        errorMessage,
        setErrorMessage,
        isLoadingSetup,
        isSaving: saveAuthenticatorMutation.isPending,
        isRegisteringPasskey: passkeyMutation.isPending,
        cooldown,
        handleSave,
        handleCopyBackupCodes,
        handleFinish,
        handleClose,
        handleSelectAuthenticatorApp,
        handleSelectPasskey
    };
}
