import { useEffect, useState } from "react";
import ChangePasswordStep from "./ChangePasswordStep";
import OtpVerificationStep from "./OtpVerificationStep";
import SuccessStep from "./SuccessStep";
import SuccessAlert from "../SuccessAlert";
import { changeCurrentUserPassword, sendProfileOtp, verifyProfileOtp } from "../../services/userSecurity";
import { formatTimestamp } from "../../utils/formatTimestamp";

export default function ChangePasswordModal({
    isOpen,
    onClose,
    email = "",
    showCurrentPassword = true,
    addAuditLog,
    setToastMessage,
    enableSuccessAlert = false,
}) {
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
    const [passwordError, setPasswordError] = useState("");
    const [otpError, setOtpError] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    useEffect(() => {
        if (step !== 2 || canResend) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setTimer((currentTime) => {
                if (currentTime <= 1) {
                    setCanResend(true);
                    return 0;
                }

                return currentTime - 1;
            });
        }, 1000);

        return () => window.clearTimeout(timeoutId);
    }, [step, timer, canResend]);

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
            setPasswordError("");
            setOtpError("");
            setIsSendingOtp(false);
            setIsResendingOtp(false);
            setIsVerifyingOtp(false);
            setTimer(60);
            setCanResend(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (step !== 3) return;

        const message = "Password changed successfully!";

        if (enableSuccessAlert) {
            setSuccessMessage(message);
            return undefined;
        }

        if (setToastMessage) {
            setToastMessage(message);

            const hide = setTimeout(() => {
                setToastMessage("");
            }, 2500);

            return () => clearTimeout(hide);
        }
    }, [step, setToastMessage, enableSuccessAlert]);

    const resetOtpTimer = () => {
        setTimer(60);
        setCanResend(false);
    };

    const handleRequestOtp = async () => {
        if (!email) {
            setPasswordError("Email is unavailable for OTP verification.");
            return;
        }

        setPasswordError("");
        setOtpError("");
        setIsSendingOtp(true);

        try {
            await sendProfileOtp(email);
            setOtp(["", "", "", "", "", ""]);
            resetOtpTimer();
            setStep(2);
        } catch (error) {
            setPasswordError(error.message || "Failed to send OTP.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend || !email) {
            return;
        }

        setOtpError("");
        setIsResendingOtp(true);

        try {
            await sendProfileOtp(email);
            setOtp(["", "", "", "", "", ""]);
            resetOtpTimer();
        } catch (error) {
            setOtpError(error.message || "Failed to resend OTP.");
        } finally {
            setIsResendingOtp(false);
        }
    };

    const verifyOTP = async (submittedCode = otp.join("")) => {
        const code = Array.isArray(submittedCode) ? submittedCode.join("") : submittedCode;

        if (code.length !== 6 || !/^\d+$/.test(code)) {
            setOtpError("Enter the complete 6-digit verification code.");
            return;
        }

        setOtpError("");
        setIsVerifyingOtp(true);

        try {
            await verifyProfileOtp(email, code);
            await changeCurrentUserPassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            if (addAuditLog) {
                addAuditLog({
                    timestamp: formatTimestamp(new Date().toISOString()),
                    action: "PASSWORD_CHANGE",
                    details: "Password changed successfully",
                    color: "yellow",
                });
            }

            setStep(3);
        } catch (error) {
            setOtpError(error.message || "Failed to verify OTP or change password.");
        } finally {
            setIsVerifyingOtp(false);
        }
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
                            onNext={handleRequestOtp}
                            showCurrentPassword={showCurrentPassword}
                            errorMessage={passwordError}
                            isSubmitting={isSendingOtp}
                            onClearError={() => setPasswordError("")}
                        />
                    )}

                    {step === 2 && (
                        <OtpVerificationStep
                            otp={otp}
                            setOtp={setOtp}
                            timer={timer}
                            canResend={canResend}
                            onResend={handleResendOtp}
                            onVerify={verifyOTP}
                            onClose={onClose}
                            errorMessage={otpError}
                            onClearError={() => setOtpError("")}
                            email={email}
                            isResending={isResendingOtp}
                            isVerifying={isVerifyingOtp}
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
