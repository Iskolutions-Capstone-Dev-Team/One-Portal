import { useState } from "react";
import ErrorAlert from "../../../components/feedback/ErrorAlert";
import { EyeIcon, EyeOffIcon, LockIcon, Check, Minus } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ChangePasswordStep({
    form,
    setForm,
    onNext,
    onClose,
    showCurrentPassword = true,
    errorMessage = "",
    isSubmitting = false,
    onClearError,
}) {
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const [showValidationError, setShowValidationError] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    const password = form.newPassword || "";
    const requirements = [
        { key: "length", label: "At least 8 characters", valid: password.length >= 8 },
        { key: "uppercase", label: "One uppercase letter", valid: /[A-Z]/.test(password) },
        { key: "number", label: "One number", valid: /[0-9]/.test(password) },
        { key: "special", label: "One special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const fields = showCurrentPassword
        ? ["currentPassword", "newPassword", "confirmPassword"]
        : ["newPassword", "confirmPassword"];

    const fieldErrors = {};

    if (showCurrentPassword && !form.currentPassword.trim()) {
        fieldErrors.currentPassword = "Current password is required.";
    }

    if (!form.newPassword.trim()) {
        fieldErrors.newPassword = "New password is required.";
    } else if (!requirements.every((requirement) => requirement.valid)) {
        fieldErrors.newPassword = "Use at least 8 characters with an uppercase letter, number, and special character.";
    }

    if (!form.confirmPassword.trim()) {
        fieldErrors.confirmPassword = "Please confirm your new password.";
    } else if (form.newPassword.trim() && form.newPassword !== form.confirmPassword) {
        fieldErrors.confirmPassword = "New password and confirmation password must match.";
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        onClearError?.();
    };

    const toggleShowPassword = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleNext = () => {
        if (Object.keys(fieldErrors).length > 0) {
            setShowValidationError(true);
            setShowErrorAlert(true);
            return;
        }

        setShowValidationError(false);
        setShowErrorAlert(false);
        onNext();
    };

    const getFieldLabel = (field) => {
        if (field === "currentPassword") return "Current Password";
        if (field === "newPassword") return "New Password";
        return "Confirm New Password";
    };

    const getFieldPlaceholder = (field) => {
        if (field === "currentPassword") return "Enter current password";
        if (field === "newPassword") return "Enter new password";
        return "Confirm new password";
    };

    const isFieldInvalid = (field) => {
        return showValidationError && Boolean(fieldErrors[field]);
    };

    const isContinueDisabled = Object.keys(fieldErrors).length > 0 || isSubmitting;
    const alertMessage = Object.values(fieldErrors)[0] ?? "";

    return (
        <>
            <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))]">
                <DialogTitle className="font-heading text-base leading-none font-medium text-white text-left">Change Password</DialogTitle>
                <DialogDescription className="sr-only">
                    Secure your account with a new password
                </DialogDescription>
            </DialogHeader>

            <div className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4 bg-white dark:bg-slate-900 flex-1">
                <form className="space-y-6 px-2 pb-6" onSubmit={(event) => event.preventDefault()}>
                    {errorMessage && (
                        <ErrorAlert
                            message={errorMessage}
                            onClose={onClearError}
                        />
                    )}

                    {showErrorAlert && showValidationError && alertMessage && (
                        <ErrorAlert
                            message={alertMessage}
                            onClose={() => setShowErrorAlert(false)}
                        />
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        {fields.map((field) => (
                            <Field className="w-full text-left space-y-2 gap-0" key={field}>
                                <div className="flex items-center justify-between gap-2">
                                    <FieldLabel htmlFor={field}>
                                        {getFieldLabel(field)}
                                        <span className="text-red-500 ml-1">*</span>
                                    </FieldLabel>
                                </div>

                                <InputGroup className={`h-10 rounded-md bg-white dark:bg-slate-950 ${isFieldInvalid(field) ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500" : "border-slate-300 dark:border-slate-700"}`}>
                                    <InputGroupAddon>
                                        <LockIcon className="text-muted-foreground size-4" />
                                    </InputGroupAddon>
                                    <InputGroupInput 
                                        id={field} 
                                        value={form[field]} 
                                        type={showPassword[field] ? "text" : "password"} 
                                        name={field} 
                                        placeholder={getFieldPlaceholder(field)} 
                                        className={isFieldInvalid(field) ? "text-red-900 dark:text-red-400" : ""}
                                        onChange={handleChange} 
                                        aria-invalid={isFieldInvalid(field)}
                                    />
                                    <InputGroupButton
                                        type="button"
                                        variant="ghost"
                                        onClick={() => toggleShowPassword(field)}
                                        aria-label={`Toggle ${getFieldLabel(field)} visibility`}
                                    >
                                        {showPassword[field] ? (
                                            <EyeOffIcon className="text-muted-foreground size-4" />
                                        ) : (
                                            <EyeIcon className="text-muted-foreground size-4" />
                                        )}
                                    </InputGroupButton>
                                </InputGroup>

                                {showValidationError && fieldErrors[field] && (
                                    <p className="text-[0.8rem] font-medium text-red-500 mt-1">{fieldErrors[field]}</p>
                                )}

                                {field === "newPassword" && (
                                    <div className="mt-3 grid gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {requirements.map((requirement) => (
                                            <p key={requirement.key} className={`flex items-center gap-2 ${requirement.valid ? "text-green-700 dark:text-green-400" : ""}`}>
                                                {requirement.valid ? (
                                                    <Check className="size-3.5 shrink-0 text-green-700 dark:text-green-400" />
                                                ) : (
                                                    <Minus className="size-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
                                                )}
                                                {requirement.label}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </Field>
                        ))}
                    </div>
                </form>
            </div>

            <DialogFooter className="-mx-4 -mb-4 border-t-0 bg-slate-50 dark:bg-slate-900/50 flex flex-row items-center justify-end gap-2 rounded-b-xl p-4">
                <Button variant="outline" onClick={onClose} className="rounded-lg h-8 px-2.5 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-900 font-bold text-sm">
                    Cancel
                </Button>
                <Button onClick={handleNext} disabled={isContinueDisabled} className="rounded-lg h-8 px-2.5 bg-[#7b0d15] hover:bg-yellow-400 text-white hover:text-[#7b0d15] border-none font-bold text-sm transition-colors">
                    {isSubmitting ? "Sending OTP..." : "Continue"}
                </Button>
            </DialogFooter>
        </>
    );
}
