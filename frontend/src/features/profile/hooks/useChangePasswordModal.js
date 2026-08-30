import { useEffect, useState } from "react";
import { toast } from "sonner";
import { changeCurrentUserPassword, sendProfileOtp, verifyProfileOtp } from "../../../services/userSecurity";
import { formatTimestamp } from "../../../utils/formatTimestamp";

const OTP_TIMER_SECONDS = 3 * 60;

export function useChangePasswordModal({ isOpen, email, addAuditLog }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(OTP_TIMER_SECONDS);
    const [canResend, setCanResend] = useState(false);
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
            setPasswordError("");
            setOtpError("");
            setIsSendingOtp(false);
            setIsResendingOtp(false);
            setIsVerifyingOtp(false);
            setTimer(OTP_TIMER_SECONDS);
            setCanResend(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (step !== 3) return;

        toast.success("Password changed successfully!");
    }, [step]);

    const resetOtpTimer = () => {
        setTimer(OTP_TIMER_SECONDS);
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
            toast.error(error.message || "Failed to send OTP.");
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
            toast.error(error.message || "Failed to resend OTP.");
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
            toast.error(error.message || "Failed to verify OTP or change password.");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    return {
        step,
        form,
        setForm,
        otp,
        setOtp,
        timer,
        canResend,
        passwordError,
        setPasswordError,
        otpError,
        setOtpError,
        isSendingOtp,
        isResendingOtp,
        isVerifyingOtp,
        handleRequestOtp,
        handleResendOtp,
        verifyOTP
    };
}
