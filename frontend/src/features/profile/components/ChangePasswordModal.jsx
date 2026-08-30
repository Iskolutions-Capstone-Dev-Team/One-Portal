import { Dialog, DialogContent } from "@/components/ui/dialog";
import ChangePasswordStep from "./ChangePasswordStep";
import OtpVerificationStep from "./OtpVerificationStep";
import SuccessStep from "./SuccessStep";
import { useChangePasswordModal } from "../hooks/useChangePasswordModal";

export default function ChangePasswordModal({
    isOpen,
    onClose,
    email = "",
    showCurrentPassword = true,
    addAuditLog,
    setToastMessage,
    enableSuccessAlert = false,
}) {
    const {
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
    } = useChangePasswordModal({ isOpen, email, addAuditLog });

    if (!isOpen) return null;
    if (typeof document === "undefined") return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
                <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="font-[Poppins] sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-transparent dark:border-white/10 ring-0 outline-none shadow-xl [&>button]:!text-white [&>button:hover]:!bg-white/20">
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
                </DialogContent>
            </Dialog>
        </>
    );
}
