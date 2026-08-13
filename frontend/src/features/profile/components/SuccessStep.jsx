import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle as InnerCardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function SuccessStep({ onClose }) {
    return (
        <>
            <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))]">
                <DialogTitle className="font-heading text-base leading-none font-medium text-white text-left">Success!</DialogTitle>
                <DialogDescription className="sr-only">
                    Password changed successfully
                </DialogDescription>
            </DialogHeader>

            <div className="-mx-4 px-4 bg-white dark:bg-slate-900 flex-1">
                <Card className="border-none shadow-none bg-transparent mx-auto w-full">
                    <CardHeader className="text-center pb-2 pt-6">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <Check className="size-8" />
                        </div>
                        <InnerCardTitle className="text-xl">Password Updated</InnerCardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-sm text-slate-500 dark:text-slate-400 pb-6">
                        <p>Your password has been changed successfully.</p>
                    </CardContent>
                </Card>
            </div>

            <DialogFooter className="-mx-4 -mb-4 border-t-0 bg-slate-50 dark:bg-slate-900/50 flex-row justify-end gap-2 rounded-b-xl p-4">
                <Button onClick={onClose} className="rounded-lg h-8 px-2.5 bg-[#7b0d15] hover:bg-yellow-400 text-white hover:text-[#7b0d15] border-none font-bold text-sm transition-colors">
                    Close
                </Button>
            </DialogFooter>
        </>
    );
}