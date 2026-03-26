import { useEffect, useState } from "react";
import ChangePasswordStep from "./ChangePasswordStep";
import OtpVerificationStep from "./OtpVerificationStep";
import SuccessStep from "./SuccessStep";
import SuccessAlert from "../SuccessAlert";

export default function ChangePasswordModal({ isOpen, onClose, showCurrentPassword = true, addAuditLog, setToastMessage, enableSuccessAlert = false }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [otpError, setOtpError] = useState("");

    useEffect(() => {
        if (step !== 2) return;

        setTimer(60);
        setCanResend(false);

        const interval = setInterval(() => {
            setTimer((currentTime) => {
                if (currentTime <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }

                return currentTime - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [step]);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setOtp(["", "", "", "", "", ""]);
            setSuccessMessage("");
            setOtpError("");
        }
    }, [isOpen]);

    useEffect(() => {
        if (step !== 3) return;

        const message = "Password changed successfully!";

        if (enableSuccessAlert) {
            setSuccessMessage(message);

            const timeout = setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

            return () => clearTimeout(timeout);
        }

        if (setToastMessage) {
            setToastMessage(message);

            const hide = setTimeout(() => {
                setToastMessage("");
            }, 2500);

            return () => clearTimeout(hide);
        }
    }, [step, setToastMessage, enableSuccessAlert]);

    const verifyOTP = (submittedCode = otp.join("")) => {
        const code = Array.isArray(submittedCode) ? submittedCode.join("") : submittedCode;

        if (code.length !== 6 || !/^\d+$/.test(code)) {
            setOtpError("Enter the complete 6-digit verification code.");
            return;
        }

        setOtpError("");

        if (addAuditLog) {
            addAuditLog({
                timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                action: "PASSWORD_CHANGE",
                details: "Password changed successfully",
                color: "yellow",
            });
        }

        setStep(3);
    };

    if (!isOpen) return null;

    return (
        <>
            <dialog className="modal modal-open profile-modal">
                <div className="modal-box profile-modal__box profile-modal__box--compact custom-scrollbar">
                    {step === 1 && (
                        <ChangePasswordStep
                            form={form}
                            setForm={setForm}
                            onClose={onClose}
                            onNext={() => setStep(2)}
                            showCurrentPassword={showCurrentPassword}
                        />
                    )}

                    {step === 2 && (
                        <OtpVerificationStep
                            otp={otp}
                            setOtp={setOtp}
                            timer={timer}
                            canResend={canResend}
                            onResend={() => {
                                setOtp(["", "", "", "", "", ""]);
                                setOtpError("");
                                setStep(1);
                            }}
                            onVerify={verifyOTP}
                            onClose={onClose}
                            errorMessage={otpError}
                            onClearError={() => setOtpError("")}
                        />
                    )}

                    {step === 3 && (
                        <SuccessStep onClose={onClose} />
                    )}
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button onClick={onClose}>close</button>
                </form>
            </dialog>
            <SuccessAlert
                message={successMessage}
                onClose={() => setSuccessMessage("")}
            />
        </>
    );
}