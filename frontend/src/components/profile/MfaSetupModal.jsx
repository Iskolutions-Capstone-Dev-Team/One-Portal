import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import ErrorAlert from "../ErrorAlert";
import { getMfaSetup, saveAuthenticator } from "../../services/userMfa";

const EMPTY_CODE = ["", "", "", "", "", ""];

function CopyCodesIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
    );
}

function CopiedCodesIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
        </svg>
    );
}

function ConnectionIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
    );
}

function AuthenticatorAppIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
    );
}

function PasskeyIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
        </svg>
    );
}

function ConnectionOptionButton({ title, description, icon, onClick, disabled = false, badge = "" }) {
    return (
        <button type="button" className="mfa-connection-option" onClick={onClick} disabled={disabled}>
            <span className="mfa-connection-option__icon">{icon}</span>
            <span className="mfa-connection-option__content">
                <span className="mfa-connection-option__title-row">
                    <span className="mfa-connection-option__title">{title}</span>
                    {badge && <span className="mfa-connection-option__badge">{badge}</span>}
                </span>
                <span className="mfa-connection-option__description">{description}</span>
            </span>
        </button>
    );
}

export default function MfaSetupModal({ isOpen, email, onClose, onSaved }) {
    const codeInputsRef = useRef([]);
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

    useEffect(() => {
        if (step === "verify") {
            codeInputsRef.current[0]?.focus();
        }
    }, [step]);

    const updateCode = (index, value) => {
        if (!/^\d?$/.test(value)) {
            return;
        }

        const nextCode = [...code];
        nextCode[index] = value;
        setCode(nextCode);
        setErrorMessage("");

        if (value && index < code.length - 1) {
            codeInputsRef.current[index + 1]?.focus();
        }
    };

    const handleCodeKeyDown = (index, event) => {
        if (event.key === "Backspace" && !code[index] && index > 0) {
            codeInputsRef.current[index - 1]?.focus();
        }
    };

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
        const backupCodesText = backupCodes.join("\n");

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
        } catch (error) {
            setErrorMessage(error.message || "Unable to copy backup codes.");
        }
    };

    const handleFinish = async () => {
        await onSaved?.();
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

    const handleSelectPasskey = () => {
        setErrorMessage("Passkey setup is not available in One Portal yet.");
    };

    if (!isOpen) {
        return null;
    }

    if (typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <dialog className="modal modal-open profile-modal mfa-modal">
            <div className="modal-box profile-modal__box mfa-modal__box custom-scrollbar">
                <section className="profile-modal__surface">
                    <div className="profile-modal__hero mfa-modal__hero">
                        <div className="mfa-modal__hero-title">
                            <span className="mfa-modal__hero-icon">
                                {step === "choice" ? <ConnectionIcon /> : <AuthenticatorAppIcon />}
                            </span>
                            <div>
                                <h3 className="profile-modal__title">
                                    {step === "choice" ? "New Connection" : "New Authenticator"}
                                </h3>
                                <p className="profile-modal__subtitle">
                                    {step === "choice"
                                        ? "Choose how you want to secure this account"
                                        : "Connect an authenticator app to your account"}
                                </p>
                            </div>
                        </div>

                        <button type="button" className="profile-modal__close" onClick={handleClose} aria-label="Close authenticator modal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="profile-modal__body mfa-modal__body">
                        {errorMessage && (
                            <ErrorAlert
                                message={errorMessage}
                                onClose={() => setErrorMessage("")}
                                autoCloseMs={5000}
                            />
                        )}

                        {step === "choice" && (
                            <div className="mfa-connection-options">
                                <ConnectionOptionButton
                                    title="Authenticator App"
                                    description="Scan a QR code and verify a 6-digit code."
                                    icon={<AuthenticatorAppIcon />}
                                    onClick={handleSelectAuthenticatorApp}
                                />
                                <ConnectionOptionButton
                                    title="Passkey"
                                    description="Use your device, browser, or security key."
                                    icon={<PasskeyIcon />}
                                    onClick={handleSelectPasskey}
                                    disabled
                                    badge="Not Available"
                                />
                            </div>
                        )}

                        {step === "scan" && (
                            <div className="mfa-setup">
                                <div className="profile-alert profile-alert--info mfa-setup__note">
                                    <span className="profile-alert__icon" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                                        </svg>
                                    </span>
                                    <p className="profile-alert__message">Note: Scan this QR code using any authenticator app before clicking Next.</p>
                                </div>

                                <div className="mfa-setup__qr-card">
                                    {isLoadingSetup ? (
                                        <div className="mfa-setup__loading">Preparing QR code...</div>
                                    ) : (
                                        qrCodeUrl && <img src={qrCodeUrl} alt="Authenticator setup QR code" className="mfa-setup__qr" />
                                    )}
                                </div>

                                <button type="button" className="profile-action profile-action--primary mfa-modal__main-action" onClick={() => setStep("verify")} disabled={isLoadingSetup || !setup.secret}>
                                    Next
                                </button>
                            </div>
                        )}

                        {step === "verify" && (
                            <div className="mfa-verify">
                                <h4 className="mfa-verify__title">Enter the code</h4>

                                <label className="profile-form__field">
                                    <span className="profile-form__label">App Name</span>
                                    <input type="text" className="profile-form__input" value={authenticatorName} onChange={(event) => setAuthenticatorName(event.target.value)} placeholder="Enter the App Name (e.g. Google Auth)"/>
                                </label>

                                <div className="profile-form__field">
                                    <span className="profile-form__label">Verification Code</span>
                                    <div className="profile-otp__inputs mfa-verify__inputs">
                                        {code.map((digit, index) => (
                                            <input key={index}
                                                ref={(element) => {
                                                    codeInputsRef.current[index] = element;
                                                }}
                                                type="text"
                                                inputMode="numeric"
                                                value={digit}
                                                maxLength={1}
                                                className={`profile-otp__input ${errorMessage ? "is-invalid" : ""}`}
                                                onChange={(event) => updateCode(index, event.target.value)}
                                                onKeyDown={(event) => handleCodeKeyDown(index, event)}
                                                aria-label={`Authenticator code digit ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="mfa-verify__actions">
                                    <button type="button" className="profile-action profile-action--primary mfa-modal__main-action" onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Authenticator"}
                                    </button>

                                    <button type="button" className="mfa-verify__back" onClick={() => setStep("scan")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m0 0 7 7M5 12l7-7" />
                                        </svg>
                                        <span>Back</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === "backupCodes" && (
                            <div className="mfa-verify mfa-backup-codes">
                                <div className="mfa-backup-codes__header">
                                    <h4 className="mfa-verify__title">Backup Codes</h4>
                                </div>

                                <div className="profile-alert profile-alert--info mfa-backup-codes__note">
                                    <span className="profile-alert__icon" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                                        </svg>
                                    </span>
                                    <p className="profile-alert__message">Save these backup codes. Use them if you lose access to your authenticator app. Each code works once.</p>
                                </div>

                                <div className="mfa-backup-codes__panel">
                                    <div className="mfa-backup-codes__panel-header">
                                        <h5 className="mfa-backup-codes__subtitle">Backup codes</h5>
                                        <button type="button" className={`mfa-backup-codes__copy ${hasCopiedBackupCodes ? "is-copied" : ""}`} onClick={handleCopyBackupCodes} aria-label={hasCopiedBackupCodes ? "Backup codes copied" : "Copy backup codes"} title={hasCopiedBackupCodes ? "Copied" : "Copy backup codes"}>
                                            {hasCopiedBackupCodes ? <CopiedCodesIcon /> : <CopyCodesIcon />}
                                        </button>
                                    </div>

                                    <div className="mfa-backup-codes__grid" aria-label="Backup codes">
                                        {backupCodes.map((backupCode) => (
                                            <code key={backupCode} className="mfa-backup-codes__code">
                                                {backupCode}
                                            </code>
                                        ))}
                                    </div>
                                </div>

                                <button type="button" className="profile-action profile-action--primary mfa-modal__main-action" onClick={handleFinish} disabled={!hasCopiedBackupCodes}>
                                    Continue
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>,
        document.body
    );
}