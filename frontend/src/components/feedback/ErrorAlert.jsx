import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/reui/alert";
import { CircleAlertIcon, XIcon } from "lucide-react";

const ALERT_TRANSITION_MS = 360;

export default function ErrorAlert({ message, onClose, autoCloseMs = 3000 }) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        let showFrame;
        let fadeTimeout;
        let autoCloseTimeout;

        if (message) {
            setShouldRender(true);

            showFrame = requestAnimationFrame(() => {
                setIsVisible(true);
            });

            autoCloseTimeout = setTimeout(() => {
                setIsVisible(false);

                fadeTimeout = setTimeout(() => {
                    onClose?.();
                    setShouldRender(false);
                }, ALERT_TRANSITION_MS);
            }, autoCloseMs);
        } else {
            setIsVisible(false);

            fadeTimeout = setTimeout(() => {
                setShouldRender(false);
            }, ALERT_TRANSITION_MS);
        }

        return () => {
            cancelAnimationFrame(showFrame);
            clearTimeout(autoCloseTimeout);
            clearTimeout(fadeTimeout);
        };
    }, [message, onClose, autoCloseMs]);

    const handleClose = () => {
        setIsVisible(false);

        setTimeout(() => {
            onClose?.();
            setShouldRender(false);
        }, ALERT_TRANSITION_MS);
    };

    if (!shouldRender) {
        return null;
    }

    return (
        <Alert 
            variant="destructive" 
            className={`transition-opacity duration-300 relative ${isVisible ? "opacity-100" : "opacity-0"}`} 
            role="alert"
        >
            <CircleAlertIcon className="w-4 h-4 text-[#7b0d15] dark:text-red-400" />
            <AlertDescription className="text-sm font-medium pr-6 text-[#7b0d15] dark:text-red-200">
                {message}
            </AlertDescription>

            {onClose && (
                <button 
                    type="button" 
                    className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity text-[#7b0d15] dark:text-red-400" 
                    onClick={handleClose} 
                    aria-label="Dismiss error alert"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            )}
        </Alert>
    );
}
