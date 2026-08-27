import { useEffect, useState } from "react";
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
    const [isLoadingSetup, setIsLoadingSetup] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);

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
            setIsLoadingSetup(false);
            setIsSaving(false);
            setIsRegisteringPasskey(false);
            return;
        }

        if (step !== "scan") {
            return;
        }

        const loadSetup = async () => {
            if (!email) {
                setErrorMessage("Email is unavailable for MFA setup.");
                return;
            }

            setErrorMessage("");
            setIsLoadingSetup(true);

            try {
                const setupData = await getMfaSetup(email);
                const qrUrl = await QRCode.toDataURL(setupData.otpauthUri, {
                    width: 320,
                    margin: 1,
                    color: {
                        dark: "#000000",
                        light: "#ffffff",
                    },
                });

                setSetup(setupData);
                setQrCodeUrl(qrUrl);
            } catch (error) {
                setErrorMessage(error.message || "Failed to prepare MFA setup.");
            } finally {
                setIsLoadingSetup(false);
            }
        };

        void loadSetup();
    }, [email, isOpen, step]);

    const handleSave = async () => {
        const submittedCode = code.join("");
        const name = authenticatorName.trim();

        if (!name) {
            setErrorMessage("Enter an authenticator name.");
            return;
        }

        if (submittedCode.length !== 6) {
            setErrorMessage("Enter the complete 6-digit authenticator code.");
            return;
        }

        setErrorMessage("");
        setIsSaving(true);

        try {
            const result = await saveAuthenticator({
                email,
                secret: setup.secret,
                code: submittedCode,
                name,
            });

            setBackupCodes(result.backupCodes);
            setHasCopiedBackupCodes(false);
            setStep("backupCodes");

            if (!result.backupCodes.length) {
                await onSaved?.();
                onClose();
            }
        } catch (error) {
            setErrorMessage(error.message || "Failed to save authenticator.");
        } finally {
            setIsSaving(false);
        }
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

    const handleSelectPasskey = async () => {
        setErrorMessage("");
        setIsRegisteringPasskey(true);

        try {
            const options = await beginPasskeyRegistration(email);
            const credential = await createPasskeyCredential(options);

            await finishPasskeyRegistration(email, credential);
            await onSaved?.();
            toast.success("Passkey connected successfully!");
            onClose();
        } catch (error) {
            setErrorMessage(error.message || "Failed to register passkey.");
        } finally {
            setIsRegisteringPasskey(false);
        }
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
        isSaving,
        isRegisteringPasskey,
        handleSave,
        handleCopyBackupCodes,
        handleFinish,
        handleClose,
        handleSelectAuthenticatorApp,
        handleSelectPasskey
    };
}
