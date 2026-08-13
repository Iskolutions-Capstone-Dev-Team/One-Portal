import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import { updateCurrentUserProfile } from "../../../services/userProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function EditProfileModal({ open, close, profileData, updateProfile, addAuditLog, allowEmailEdit = false }) {
    const [profile, setProfile] = useState({
        id: "",
        firstName: "",
        middleName: "",
        lastName: "",
        nameSuffix: "",
        email: "",
    });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const personalFields = [
        {
            name: "firstName",
            label: "First Name",
            placeholder: "Enter first name",
            helper: "Max 50 characters",
            required: true,
        },
        {
            name: "lastName",
            label: "Last Name",
            placeholder: "Enter last name",
            helper: "Max 50 characters",
            required: true,
        },
        {
            name: "middleName",
            label: "Middle Name",
            placeholder: "Enter middle name",
            helper: "Max 50 characters",
            required: false,
        },
        {
            name: "nameSuffix",
            label: "Suffix",
            placeholder: "Enter suffix",
            helper: "Optional",
            required: false,
        },
    ];

    const errorMessage = Object.values(errors)[0] ?? "";

    useEffect(() => {
        if (!open) {
            return;
        }

        setErrors({});
        setIsSaving(false);

        if (profileData) {
            setProfile(profileData);
        }
    }, [open, profileData]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((prev) => ({ ...prev, [name]: value }));

        setErrors((currentErrors) => {
            if (!currentErrors[name]) {
                return currentErrors;
            }

            const nextErrors = { ...currentErrors };
            delete nextErrors[name];

            if (Object.keys(nextErrors).length === 0) {
                // all clear
            }

            return nextErrors;
        });
    };

    const handleSave = async () => {
        const nextErrors = {};

        if (!profile.firstName.trim()) {
            nextErrors.firstName = "First name is required.";
        }

        if (!profile.lastName.trim()) {
            nextErrors.lastName = "Last name is required.";
        }

        if (allowEmailEdit && !profile.email.trim()) {
            nextErrors.email = "Email is required.";
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setErrors({});
        setIsSaving(true);

        try {
            const savedProfile = await updateCurrentUserProfile(profile);

            if (updateProfile) {
                updateProfile(savedProfile);
            }

            if (addAuditLog) {
                addAuditLog({
                    timestamp: formatTimestamp(new Date().toISOString()),
                    action: "PROFILE_UPDATE",
                    details: "Updated profile information",
                    color: "blue",
                });
            }

            close();
        } catch (error) {
            toast.error(error.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) close(); }}>
            <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="font-[Poppins] sm:max-w-2xl bg-white dark:bg-slate-900 border-none ring-0 outline-none shadow-xl [&>button]:text-white [&>button:hover]:bg-white/20">
                <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))]">
                    <DialogTitle className="font-heading text-base leading-none font-medium text-white text-left">Edit Profile</DialogTitle>
                    <DialogDescription className="sr-only">
                        Update your personal information
                    </DialogDescription>
                </DialogHeader>
                
                <div className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4">
                    <form id="edit-profile-form" className="space-y-6 px-2 pb-6" onSubmit={(event) => event.preventDefault()}>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {personalFields.map((field) => (
                                <Field key={field.name} className="w-full text-left space-y-2 gap-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <FieldLabel htmlFor={field.name}>
                                            {field.label}
                                            {field.required && <span className="text-red-500">*</span>}
                                        </FieldLabel>
                                        {!field.required && field.name === 'nameSuffix' && (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#7b0d15]/30 text-[#7b0d15] bg-[#7b0d15]/5">
                                                Optional
                                            </span>
                                        )}
                                    </div>
                                    <Input 
                                        id={field.name} 
                                        type="text" 
                                        name={field.name} 
                                        placeholder={field.placeholder} 
                                        value={profile[field.name]} 
                                        onChange={handleChange} 
                                        className={`flex h-10 w-full rounded-md border ${errors[field.name] ? "border-red-500 focus-visible:ring-red-500" : "border-slate-300 dark:border-slate-700 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"} bg-white dark:bg-slate-950 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-slate-100 transition-colors duration-200`}
                                        maxLength={50}
                                    />
                                    {errors[field.name] && (
                                        <p className="text-[0.8rem] font-medium text-red-500">{errors[field.name]}</p>
                                    )}
                                </Field>
                            ))}
                        </div>

                        {allowEmailEdit && (
                            <Field className="w-full text-left space-y-2 gap-0">
                                <FieldLabel htmlFor="email">
                                    Email Address
                                    <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    name="email" 
                                    placeholder="Enter email" 
                                    value={profile.email} 
                                    onChange={handleChange} 
                                    className={`flex h-10 w-full rounded-md border ${errors.email ? "border-red-500 focus-visible:ring-red-500" : "border-slate-300 dark:border-slate-700 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"} bg-white dark:bg-slate-950 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-slate-100 transition-colors duration-200`}
                                />
                                {errors.email && (
                                    <p className="text-[0.8rem] font-medium text-red-500">{errors.email}</p>
                                )}
                            </Field>
                        )}
                    </form>
                </div>

                <DialogFooter className="border-t-0 bg-slate-50 dark:bg-slate-900/50 flex-row justify-end gap-2 rounded-b-xl p-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="rounded-lg h-8 px-2.5 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-900 font-bold text-sm">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isSaving} className="rounded-lg h-8 px-2.5 bg-[#7b0d15] hover:bg-yellow-400 text-white hover:text-[#7b0d15] border-none font-bold text-sm transition-colors">
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
