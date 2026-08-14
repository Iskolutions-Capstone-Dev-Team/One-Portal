import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { deleteAuthenticator, getAuthenticators } from "../../../services/userMfa";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import { toast } from "sonner";
import MfaDeleteConfirmModal from "./MfaDeleteConfirmModal";
import MfaSetupModal from "./MfaSetupModal";
import { CalendarIcon, ClockIcon } from "./profileIcons";
import { Button } from "@/components/ui/button";
import { KeySquare, Smartphone, Trash } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

function AutomationIllustration() {
    return (
        <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Left connection line with arrow */}
            <path d="M30 60 L68 60" className="stroke-[#7b0d15]/30 dark:stroke-red-400/30" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowhead)"/>
            <polygon points="66,56 74,60 66,64" className="fill-[#7b0d15]/30 dark:fill-red-400/30"/>

            {/* Toggle body */}
            <rect x="76" y="42" width="56" height="36" rx="18" className="stroke-[#7b0d15]/60 fill-[#7b0d15]/5 dark:stroke-red-400/60 dark:fill-red-400/10" strokeWidth="2"/>
            {/* Toggle circle */}
            <circle cx="94" cy="60" r="12" className="fill-[#7b0d15]/40 dark:fill-red-400/40" />
            <circle cx="94" cy="60" r="6" className="fill-[#7b0d15] dark:fill-red-400" />

            {/* Right connection line */}
            <path d="M134 60 Q150 60 158 48" className="stroke-[#7b0d15]/30 dark:stroke-red-400/30" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="162" cy="44" r="3" className="fill-[#7b0d15]/20 dark:fill-red-400/20" />

            {/* Bottom right connection */}
            <path d="M134 60 Q150 60 158 72" className="stroke-[#7b0d15]/30 dark:stroke-red-400/30" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="162" cy="76" r="3" className="fill-[#7b0d15]/20 dark:fill-red-400/20" />

            {/* Decorative dots */}
            <circle cx="22" cy="60" r="2" className="fill-[#7b0d15]/20 dark:fill-red-400/20" />
            <circle cx="174" cy="44" r="2" className="fill-[#7b0d15]/15 dark:fill-red-400/15" />
            <circle cx="174" cy="76" r="2" className="fill-[#7b0d15]/15 dark:fill-red-400/15" />
        </svg>
    );
}

function formatAuthenticatorDate(value) {
    if (!value) {
        return "Never";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return formatTimestamp(date.toISOString());
}

function formatAuthenticatorType(value) {
    if (!value) {
        return "authenticator app";
    }

    const type = String(value).toLowerCase();

    if (type === "passkey") {
        return "passkey";
    }

    if (type === "totp") {
        return "authenticator app";
    }

    return type;
}

export default function AuthenticatorApps({ email, isProfileLoading = false }) {
    const [authenticators, setAuthenticators] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [pendingDeleteAuthenticator, setPendingDeleteAuthenticator] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const loadAuthenticators = useCallback(async () => {
        if (isProfileLoading) {
            setAuthenticators([]);
            setIsLoading(true);
            setErrorMessage("");
            return;
        }

        if (!email) {
            setAuthenticators([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
            const authenticatorList = await getAuthenticators(email);
            setAuthenticators(authenticatorList);
        } catch (error) {
            setErrorMessage(error.message || "Failed to load authenticators.");
        } finally {
            setIsLoading(false);
        }
    }, [email, isProfileLoading]);

    useEffect(() => {
        void loadAuthenticators();
    }, [loadAuthenticators]);

    useEffect(() => {
        setCurrentSlide(0);
    }, [authenticators.length]);

    const handleDeleteClick = (authenticator) => {
        setPendingDeleteAuthenticator(authenticator);
        setErrorMessage("");
    };

    const handleCancelDelete = () => {
        if (deletingId) {
            return;
        }

        setPendingDeleteAuthenticator(null);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteAuthenticator) {
            return;
        }

        setDeletingId(pendingDeleteAuthenticator.id);
        setErrorMessage("");

        try {
            await deleteAuthenticator({ email, id: pendingDeleteAuthenticator.id });
            await loadAuthenticators();
            toast.success("Authenticator removed successfully!");
            setPendingDeleteAuthenticator(null);
        } catch (error) {
            setErrorMessage(error.message || "Failed to remove authenticator.");
        } finally {
            setDeletingId("");
        }
    };

    const handleSaved = async () => {
        await loadAuthenticators();
    };

    const renderAuthenticatorCard = (authenticator) => (
        <Card key={authenticator.id} className="w-full overflow-hidden p-0 relative group shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-300 h-full flex flex-col">
            <CardContent className="flex flex-col items-center p-0 h-full flex-1">
                <div className="flex w-full flex-col items-center justify-center bg-gradient-to-b from-[#7b0d15]/10 dark:from-[#7b0d15]/30 to-transparent py-12 rounded-t-xl shrink-0">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 scale-150 rounded-full bg-[#7b0d15]/10 dark:bg-[#7b0d15]/30 blur-2xl" />
                        <span className="relative block text-[#7b0d15] dark:text-[#f8d24e]">
                            {String(authenticator.type || "").toLowerCase() === "passkey" ? (
                                <KeySquare className="size-16" strokeWidth={1.5} />
                            ) : (
                                <Smartphone className="size-16" strokeWidth={1.5} />
                            )}
                        </span>
                    </div>
                    <h3 className="text-foreground text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {authenticator.name || "Authenticator"}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium text-slate-500 dark:text-slate-400 capitalize truncate">
                        {formatAuthenticatorType(authenticator.type)}
                    </p>

                    <button type="button" className="absolute top-4 right-4 w-8 h-8 inline-flex items-center justify-center text-[#7b0d15] hover:bg-[#7b0d15]/10 dark:text-red-400 dark:hover:bg-[#7b0d15]/30 rounded-full transition-colors disabled:opacity-50" onClick={() => handleDeleteClick(authenticator)} disabled={deletingId === authenticator.id} aria-label={`Delete ${authenticator.name || "authenticator"}`}>
                        <Trash className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="w-full space-y-1 px-3 pb-6 mt-auto">
                    <div className="rounded-lg flex items-center justify-between px-2 sm:px-3 py-2.5 gap-2 min-h-[52px] bg-slate-100/60 dark:bg-slate-800/60">
                        <span className="flex items-center gap-2 text-foreground text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <span className="text-slate-400 dark:text-slate-500 w-4 h-4 block"><CalendarIcon /></span> Added
                        </span>
                        <span className="text-muted-foreground text-xs text-slate-500 dark:text-slate-400 text-right leading-tight whitespace-pre-wrap">
                            {formatAuthenticatorDate(authenticator.createdAt)}
                        </span>
                    </div>
                    <div className="rounded-lg flex items-center justify-between px-2 sm:px-3 py-2.5 gap-2 min-h-[52px]">
                        <span className="flex items-center gap-2 text-foreground text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <span className="text-slate-400 dark:text-slate-500 w-4 h-4 block"><ClockIcon /></span> Last used
                        </span>
                        <span className="text-muted-foreground text-xs text-slate-500 dark:text-slate-400 text-right leading-tight whitespace-pre-wrap">
                            {formatAuthenticatorDate(authenticator.lastUsedAt)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Card className="mt-6 py-0 bg-white dark:bg-slate-800 shadow-sm border-none rounded-3xl ring-0 ring-offset-0 transition-colors duration-300">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2 px-6 sm:px-10 pt-6 sm:pt-10 rounded-t-3xl bg-transparent">
                    <div>
                        <CardTitle className="text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">AUTHENTICATOR APPS</CardTitle>
                        <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage the authenticator apps connected to your account.</CardDescription>
                    </div>

                    <Button onClick={() => setModalOpen(true)} disabled={!email} className="bg-[#7b0d15] text-white hover:bg-yellow-400 hover:text-[#7b0d15] border border-[#7b0d15]/70 hover:border-yellow-400 min-h-[2.5rem] md:min-h-[2.65rem] px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-extrabold text-xs md:text-[0.9rem] shadow-lg transition-all hover:-translate-y-[1px] h-auto cursor-pointer flex flex-row items-center justify-center gap-1.5 md:gap-2">
                        + New Connection
                    </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 lg:p-8">

                    {errorMessage && (
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">{errorMessage}</p>
                    )}

                    {isLoading ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-12">
                            {isProfileLoading ? "Loading profile..." : "Loading authenticators..."}
                        </p>
                    ) : !email ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">Reload the page or sign in again.</p>
                    ) : (
                        <div>
                            {authenticators.length > 0 ? (
                                <Carousel
                                    opts={{
                                        align: "start",
                                    }}
                                    className="w-full relative px-0 sm:px-12"
                                >
                                    <CarouselContent className="-ml-2">
                                        {authenticators.map((authenticator, index) => (
                                            <CarouselItem key={authenticator.id} className="sm:basis-1/2 lg:basis-1/3 pl-2">
                                                <div className="p-1 h-[372px]">
                                                    {renderAuthenticatorCard(authenticator)}
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-0 bg-[#7b0d15] hover:bg-yellow-400 text-white hover:text-[#7b0d15] border-none" />
                                    <CarouselNext className="right-0 bg-[#7b0d15] hover:bg-yellow-400 text-white hover:text-[#7b0d15] border-none" />
                                </Carousel>
                            ) : (
                                <div className="flex items-center justify-center p-4">
                                    <Empty className="py-12">
                                        <EmptyHeader>
                                            <EmptyMedia>
                                                <AutomationIllustration />
                                            </EmptyMedia>
                                            <EmptyTitle>No authenticator yet</EmptyTitle>
                                            <EmptyDescription>
                                                Get started by setting up your authenticator.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                        <EmptyContent>
                                            <Button onClick={() => setModalOpen(true)} className="bg-[#7b0d15] text-white hover:bg-yellow-400 hover:text-[#7b0d15] transition-all">
                                                New connection
                                            </Button>
                                        </EmptyContent>
                                    </Empty>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <MfaSetupModal
                isOpen={isModalOpen}
                email={email}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />

            <MfaDeleteConfirmModal
                authenticator={pendingDeleteAuthenticator}
                isDeleting={Boolean(deletingId)}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />

        </>
    );
}
