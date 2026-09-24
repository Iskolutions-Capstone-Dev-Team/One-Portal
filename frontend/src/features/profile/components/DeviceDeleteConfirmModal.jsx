import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trash2Icon } from 'lucide-react'

export default function DeviceDeleteConfirmModal({ device, isDeleting, onCancel, onConfirm }) {
    if (!device) return null;

    return (
        <AlertDialog open={!!device} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-yellow-400/20 dark:text-yellow-400">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Remove {device.name || "this device"}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This device will require MFA again.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="ghost" onClick={onCancel} disabled={isDeleting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        variant="destructive"
                        className="dark:bg-yellow-400/20 dark:text-yellow-400 dark:hover:bg-yellow-400/30"
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }} 
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Removing..." : "Remove"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
