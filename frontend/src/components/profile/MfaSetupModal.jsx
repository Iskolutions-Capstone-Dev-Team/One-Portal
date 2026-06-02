import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import ErrorAlert from "../ErrorAlert";
import { getMfaSetup, saveAuthenticator } from "../../services/userMfa";

const EMPTY_CODE = ["", "", "", "", "", ""];

export default function MfaSetupModal({ isOpen, email, onClose, onSaved }) {
    const codeInputsRef = useRef([]);
    const [step, setStep] = useState("scan");
    const [setup, setSetup] = useState({ secret: "", otpauthUri: "" });
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [authenticatorName, setAuthenticatorName] = useState("");
    const [code, setCode] = useState(EMPTY_CODE);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoadingSetup, setIsLoadingSetup] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep("scan");
            setSetup({ secret: "", otpauthUri: "" });
            setQrCodeUrl("");
            setAuthenticatorName("");
            setCode(EMPTY_CODE);
            setErrorMessage("");
            setIsLoadingSetup(false);
            setIsSaving(false);
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
    }, [email, isOpen]);

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
            await saveAuthenticator({
                email,
                secret: setup.secret,
                code: submittedCode,
                name,
            });

            await onSaved?.();
            onClose();
        } catch (error) {
            setErrorMessage(error.message || "Failed to save authenticator.");
        } finally {
            setIsSaving(false);
        }
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
                        <div>
                            <h3 className="profile-modal__title">New Authenticator</h3>
                            <p className="profile-modal__subtitle">Connect an authenticator app to your account</p>
                        </div>

                        <button type="button" className="profile-modal__close" onClick={onClose} aria-label="Close authenticator modal">
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

                        {step === "scan" && (
                            <div className="mfa-setup">
                                <div className="profile-alert profile-alert--info mfa-setup__note">
                                    <span className="profile-alert__icon" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                                        </svg>
                                    </span>
                                    <p className="profile-alert__message">Scan this QR code using any authenticator app before clicking Next.</p>
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
                                    <span className="profile-form__label">Authenticator Name</span>
                                    <input type="text" className="profile-form__input" value={authenticatorName} onChange={(event) => setAuthenticatorName(event.target.value)} placeholder="Enter the App Name (e.g. Google Auth)"/>
                                </label>

                                <div className="profile-form__field">
                                    <span className="profile-form__label">Authenticator code</span>
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
                                    <button type="button" className="profile-action profile-action--secondary mfa-verify__back" onClick={() => setStep("scan")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <button type="button" className="profile-action profile-action--primary mfa-modal__main-action" onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Authenticator"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>,
        document.body
    );
}