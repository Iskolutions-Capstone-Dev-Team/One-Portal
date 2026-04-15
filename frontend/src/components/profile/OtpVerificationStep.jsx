import { useEffect, useRef } from "react";
import ErrorAlert from "../ErrorAlert";

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
    const inputsRef = useRef([]);
    const otpValue = otp.join("");
    const isVerifyDisabled = otpValue.length !== 6 || isVerifying;

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);
        onClearError?.();

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    return (
        <section className="profile-modal__surface">
            <div className="profile-modal__hero">
                <div>
                    <h3 className="profile-modal__title">Verify Identity</h3>
                    <p className="profile-modal__subtitle">Enter the OTP sent to your email</p>
                </div>

                <button type="button" className="profile-modal__close" onClick={onClose} aria-label="Close OTP verification modal">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="profile-modal__body">
                <div className="profile-otp">
                    {errorMessage && (
                        <ErrorAlert
                            message={errorMessage}
                            onClose={onClearError}
                        />
                    )}

                    <div className="profile-otp__intro">
                        <div className="profile-otp__icon" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <h4 className="profile-otp__title">Check Your Email</h4>
                        <p className="profile-otp__text">
                            We've sent a 6-digit verification code to
                            <span className="profile-otp__email">{email || "your email address"}</span>
                        </p>
                        <p className="profile-otp__timer-note">The code will expire in 10 minutes</p>
                    </div>

                    <div className="profile-otp__inputs">
                        {otp.map((digit, idx) => (
                            <input key={idx} ref={(el) => (inputsRef.current[idx] = el)} type="text" value={digit} onChange={(event) => handleChange(idx, event.target.value)} onKeyDown={(event) => handleKeyDown(idx, event)} className={`profile-otp__input ${errorMessage ? "is-invalid" : ""}`} maxLength={1} aria-label={`OTP digit ${idx + 1}`}/>
                        ))}
                    </div>

                    <p className="profile-otp__hint">Enter the 6-digit code</p>

                    <div className="profile-otp__resend">
                        <p className="profile-otp__resend-text">Didn't receive the code?</p>
                        <button type="button" disabled={!canResend || isResending} onClick={onResend} className="profile-link-button">
                            {isResending ? "Resending..." : "Resend OTP"}
                        </button>
                        <p className="profile-otp__resend-timer">
                            Resend available in <span>00:{String(timer).padStart(2, "0")}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="profile-modal__footer profile-modal__footer--center">
                <div className="profile-modal__actions">
                    <button type="button" className="profile-action profile-action--primary" onClick={() => onVerify()} disabled={isVerifyDisabled}>
                        {isVerifying ? "Verifying..." : "Verify &amp; Change Password"}
                    </button>
                </div>
            </div>
        </section>
    );
}
