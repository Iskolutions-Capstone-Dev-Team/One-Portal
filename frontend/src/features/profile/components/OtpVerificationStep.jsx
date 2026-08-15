import { useEffect } from "react";
import ErrorAlert from "../../../components/feedback/ErrorAlert";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle as InnerCardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, RefreshCw } from "lucide-react";

function formatTimer(secondsRemaining) {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function OtpVerificationStep({
    otp,
    setOtp,
    timer,
    canResend,
    onResend,
    onVerify,
    onClose,
    errorMessage,
    onClearError,
    email = "",
    isResending = false,
    isVerifying = false,
}) {
    const otpValue = otp.join("");
    const isVerifyDisabled = otpValue.length !== 6 || isVerifying;

    const handleOtpChange = (value) => {
        const newOtp = value.split("").concat(Array(6 - value.length).fill(""));
        setOtp(newOtp.slice(0, 6));
        onClearError?.();
    };

    return (
        <>
            <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))]">
                <DialogTitle className="font-heading text-base leading-none font-medium text-white text-left">Verify Identity</DialogTitle>
                <DialogDescription className="sr-only">
                    Enter the OTP sent to your email
                </DialogDescription>
            </DialogHeader>

            <div className="-mx-4 px-4 bg-white dark:bg-transparent flex-1">
                <Card className="border-none shadow-none bg-transparent mx-auto w-full">
                    {errorMessage && (
                        <div className="w-full pb-2">
                            <ErrorAlert message={errorMessage} onClose={onClearError} />
                        </div>
                    )}

                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <Mail className="size-8" />
                        </div>
                        <InnerCardTitle className="text-xl">Check Your Email</InnerCardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-2 space-y-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center text-balance mx-auto sm:px-4">
                            Enter the verification code we sent to your email address: <strong className="text-slate-900 dark:text-slate-100">{email || "your email address"}</strong>.
                        </p>

                        <div>
                            <div className="flex flex-col items-center">
                                <div className="w-fit">
                                    <div className="mb-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-100">
                                            Verification code
                                        </label>
                                    </div>
                                    <InputOTP maxLength={6} id="otp-verification" required value={otpValue} onChange={handleOtpChange} disabled={isVerifying}>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl border-slate-300 dark:border-slate-700" />
                                            <InputOTPSlot index={1} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl border-slate-300 dark:border-slate-700" />
                                            <InputOTPSlot index={2} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl border-slate-300 dark:border-slate-700" />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl border-slate-300 dark:border-slate-700" />
                                            <InputOTPSlot index={4} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl border-slate-300 dark:border-slate-700" />
                                            <InputOTPSlot index={5} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl border-slate-300 dark:border-slate-700" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-3">
                                <Button variant={canResend ? "default" : "secondary"} size="sm" type="button" disabled={!canResend || isResending} onClick={onResend} className={canResend ? "bg-[#6b1115] dark:bg-yellow-400 text-white dark:text-[#7b0d15] hover:bg-yellow-400 dark:hover:bg-[#7b0d15] hover:text-[#4f0d17] dark:hover:text-yellow-400 border-none transition-colors" : ""}>
                                    <RefreshCw className={`size-3.5 mr-2 ${isResending ? "animate-spin" : ""}`} />
                                    {isResending ? "Resending..." : "Resend Code"}
                                </Button>
                                <span className="text-sm text-slate-500 font-mono">{formatTimer(timer)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DialogFooter className="-mx-4 -mb-4 border-t-0 bg-slate-50 dark:bg-transparent flex-row justify-end gap-2 rounded-b-xl p-4">
                <Button variant="outline" onClick={onClose} className="rounded-lg h-8 px-2.5 border-slate-200 dark:border-white/20 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 bg-white dark:bg-transparent font-bold text-sm">
                    Cancel
                </Button>
                <Button onClick={() => onVerify()} disabled={isVerifyDisabled} className="rounded-lg h-8 px-2.5 bg-[#6b1115] dark:bg-yellow-400 text-white dark:text-[#7b0d15] hover:bg-yellow-400 dark:hover:bg-[#7b0d15] hover:text-[#4f0d17] dark:hover:text-yellow-400 border border-[#6b1115]/70 dark:border-yellow-400 dark:hover:border-[#7b0d15] font-bold text-sm transition-colors">
                    {isVerifying ? "Verifying..." : "Verify"}
                </Button>
            </DialogFooter>
        </>
    );
}
