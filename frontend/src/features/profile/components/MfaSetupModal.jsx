import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import ErrorAlert from "../../../components/feedback/ErrorAlert";
import { beginPasskeyRegistration, finishPasskeyRegistration, getMfaSetup, saveAuthenticator } from "../../../services/userMfa";
import { createPasskeyCredential } from "../../../utils/webAuthn";
import { AuthenticatorAppIcon, CopiedCodesIcon, CopyCodesIcon, PasskeyIcon, CloseIcon, InfoCircleIcon, ArrowLeftIcon } from "./profileIcons";
import { Alert, AlertDescription } from "@/components/reui/alert";
import { CircleAlertIcon, CircleHelp, Copy, CopyCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KeySquare, Smartphone } from "lucide-react";
import { Field } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Badge } from "@/components/reui/badge";
import { toast } from "sonner";

const EMPTY_CODE = ["", "", "", "", "", ""];

function ConnectionOptionButton({ title, description, icon, onClick, disabled = false }) {
    return (
        <Button variant="outline" className="group/button w-full h-auto justify-start gap-3 px-4 py-3 text-left mb-3 whitespace-normal bg-white dark:bg-[#141414] border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#1f1f1f] text-slate-900 dark:text-slate-100" onClick={onClick} disabled={disabled}>
            <div className="bg-slate-100 dark:bg-[#2a2a2a] text-slate-900 dark:text-white group-hover/button:bg-white dark:group-hover/button:bg-[#1f1f1f] rounded-md flex size-10 items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm">{title}</span>
                <span className="text-muted-foreground text-xs font-normal">
                    {description}
                </span>
            </div>
        </Button>
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

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="p-4 sm:max-w-[425px] gap-0 bg-white dark:bg-[#0a0a0a] border border-transparent dark:border-white/10 ring-0 outline-none shadow-xl [&>button]:hidden">
                <div className="flex flex-col gap-2 -mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white relative">
                    <DialogTitle className="font-heading text-base leading-none font-medium text-white text-left">
                        {step === "choice" ? "New Connection" : "New Authenticator"}
                    </DialogTitle>
                </div>

                <div className="py-2">
                    {errorMessage && (
                        <div className="mb-6">
                            <ErrorAlert
                                message={errorMessage}
                                onClose={() => setErrorMessage("")}
                                autoCloseMs={5000}
                            />
                        </div>
                    )}

                    {step === "choice" && (
                        <div>
                            <ConnectionOptionButton
                                title="Authenticator App"
                                description="Scan a QR code and verify a 6-digit code."
                                icon={<Smartphone aria-hidden="true" className="size-5" />}
                                onClick={handleSelectAuthenticatorApp}
                                disabled={isRegisteringPasskey}
                            />
                            <ConnectionOptionButton
                                title="Passkey"
                                description={isRegisteringPasskey ? "Creating passkey..." : "Use your device, browser, or security key."}
                                icon={<KeySquare aria-hidden="true" className="size-5" />}
                                onClick={handleSelectPasskey}
                                disabled={isRegisteringPasskey}
                            />
                        </div>
                    )}

                    {step === "scan" && (
                        <div>
                            <h2 className="text-xl font-bold text-center mb-4 text-slate-900 dark:text-slate-100">Scan the QR code</h2>
                            
                            <Alert variant="info" className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50 [&>svg]:!text-blue-600 dark:[&>svg]:!text-blue-400">
                                <CircleAlertIcon className="w-4 h-4" />
                                <AlertDescription className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Note: Scan this QR code using any authenticator app before clicking Next.
                                </AlertDescription>
                            </Alert>

                            <div className="flex justify-center mb-6">
                                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    {isLoadingSetup ? (
                                        <div className="w-48 h-48 flex items-center justify-center text-slate-500 font-medium">Preparing QR code...</div>
                                    ) : (
                                        qrCodeUrl && <img src={qrCodeUrl} alt="Authenticator setup QR code" className="w-48 h-48" />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "verify" && (
                        <div>
                            <h2 className="text-xl font-bold text-center mb-4 text-slate-900 dark:text-slate-100">Enter the code</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">App Name</label>
                                <Field className="w-full">
                                    <InputGroup className="h-10 gap-0 border border-slate-300 dark:border-white/10 rounded-md bg-white dark:bg-[#141414] transition-colors duration-200 !ring-0 focus-within:!ring-2 focus-within:!ring-slate-300 dark:focus-within:!ring-white/20 focus-within:!border-slate-300 dark:focus-within:!border-white/10 shadow-none overflow-hidden">
                                        <InputGroupAddon className="flex items-center h-full">
                                            <Popover>
                                                <PopoverTrigger type="button" className="flex items-center justify-center px-3 cursor-help outline-none h-full">
                                                    <CircleHelp className="text-emerald-500 w-5 h-5" />
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="w-72 z-50 p-4">
                                                    <PopoverHeader className="mb-2">
                                                        <PopoverTitle className="font-semibold text-sm">Authenticator Name</PopoverTitle>
                                                        <PopoverDescription className="text-sm text-slate-600 dark:text-slate-400">
                                                            Your app name should not be identical to your other existing auth app.
                                                        </PopoverDescription>
                                                    </PopoverHeader>
                                                </PopoverContent>
                                            </Popover>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            type="text"
                                            className="h-full w-full border-y-0 border-r-0 border-l border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none rounded-none focus:ring-0 focus-visible:ring-0"
                                            value={authenticatorName}
                                            onChange={(event) => setAuthenticatorName(event.target.value)}
                                            placeholder="Enter the App Name (e.g. Google Auth)"
                                        />
                                    </InputGroup>
                                </Field>
                            </div>

                            <div className="mb-6 flex flex-col items-center">
                                <label className="block w-full text-left text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Verification Code</label>
                                <InputOTP 
                                    maxLength={6} 
                                    value={code.join("")} 
                                    onChange={(val) => {
                                        const arr = ["", "", "", "", "", ""];
                                        for(let i=0; i<val.length; i++) arr[i] = val[i];
                                        setCode(arr);
                                    }}
                                    disabled={isSaving}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} className={`w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl ${errorMessage ? "border-red-500" : "border-slate-300 dark:border-[#262626]"}`} />
                                        <InputOTPSlot index={1} className={`w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl ${errorMessage ? "border-red-500" : "border-slate-300 dark:border-[#262626]"}`} />
                                        <InputOTPSlot index={2} className={`w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl ${errorMessage ? "border-red-500" : "border-slate-300 dark:border-[#262626]"}`} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} className={`w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl ${errorMessage ? "border-red-500" : "border-slate-300 dark:border-[#262626]"}`} />
                                        <InputOTPSlot index={4} className={`w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl ${errorMessage ? "border-red-500" : "border-slate-300 dark:border-[#262626]"}`} />
                                        <InputOTPSlot index={5} className={`w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl ${errorMessage ? "border-red-500" : "border-slate-300 dark:border-[#262626]"}`} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        </div>
                    )}

                    {step === "backupCodes" && (
                        <div>
                            <Alert variant="info" className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50 [&>svg]:!text-blue-600 dark:[&>svg]:!text-blue-400">
                                <CircleAlertIcon className="w-4 h-4" />
                                <AlertDescription className="text-blue-700 dark:text-blue-300">
                                    Save these backup codes. Use them if you lose access to your authenticator app. Each code works once.
                                </AlertDescription>
                            </Alert>

                            <div className="mb-6 rounded-xl border border-slate-200 dark:border-white/10 bg-white shadow-sm dark:bg-[#141414] p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Backup codes</h5>
                                    <button type="button" className={`p-1.5 rounded-md transition-colors ${hasCopiedBackupCodes ? "bg-green-100 text-green-700" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`} onClick={handleCopyBackupCodes} aria-label={hasCopiedBackupCodes ? "Backup codes copied" : "Copy backup codes"} title={hasCopiedBackupCodes ? "Copied" : "Copy backup codes"}>
                                        {hasCopiedBackupCodes ? <CopyCheck className="w-4 h-4" /> : <Copy className="w-4 h-4 text-slate-500" />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3" aria-label="Backup codes">
                                    {backupCodes.map((backupCode) => (
                                        <Badge key={backupCode} variant="secondary" className="font-mono font-medium text-[15px] tracking-widest flex items-center justify-center w-full px-3 py-2.5 h-11 rounded-lg shadow-sm transition-colors text-slate-800 dark:text-slate-200 backdrop-blur-md border border-slate-200 dark:border-slate-700">
                                            {backupCode}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="-mx-4 -mb-4 mt-2 flex flex-row items-center justify-end gap-2 rounded-b-xl border-t-0 bg-slate-50 dark:bg-transparent p-4">
                    {step === "verify" ? (
                        <Button variant="outline" onClick={() => setStep("scan")} className="rounded-lg h-8 px-4 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 bg-white dark:bg-transparent font-bold text-sm">
                            Back
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={handleClose} className="rounded-lg h-8 px-4 border-slate-200 dark:border-white/20 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 bg-white dark:bg-transparent font-bold text-sm">
                            Cancel
                        </Button>
                    )}
                    
                    {step === "scan" && (
                        <Button onClick={() => setStep("verify")} disabled={isLoadingSetup || !setup.secret} className="rounded-lg h-8 px-4 bg-[#6b1115] hover:bg-yellow-400 text-white dark:text-[#7b0d15] dark:bg-yellow-400 dark:hover:bg-[#7b0d15] hover:text-[#4f0d17] dark:hover:text-yellow-400 border-none font-bold text-sm transition-colors">
                            Next
                        </Button>
                    )}

                    {step === "verify" && (
                        <Button onClick={handleSave} disabled={isSaving || !authenticatorName.trim() || code.some(c => !c)} className="rounded-lg h-8 px-4 bg-[#6b1115] hover:bg-yellow-400 text-white dark:text-[#7b0d15] dark:bg-yellow-400 dark:hover:bg-[#7b0d15] hover:text-[#4f0d17] dark:hover:text-yellow-400 border-none font-bold text-sm transition-colors">
                            {isSaving ? "Connecting..." : "Connect"}
                        </Button>
                    )}

                    {step === "backupCodes" && (
                        <Button onClick={handleFinish} disabled={!hasCopiedBackupCodes} className="rounded-lg h-8 px-4 bg-[#6b1115] hover:bg-yellow-400 text-white dark:text-[#7b0d15] dark:bg-yellow-400 dark:hover:bg-[#7b0d15] hover:text-[#4f0d17] dark:hover:text-yellow-400 border-none font-bold text-sm transition-colors">
                            Continue
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
