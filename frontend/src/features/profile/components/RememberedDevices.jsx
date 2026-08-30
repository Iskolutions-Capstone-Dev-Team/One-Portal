import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Smartphone, Tablet, Trash, CalendarDays, Edit2, ShieldCheck, MapPin, Clock, Globe } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useRememberedDevices } from "../hooks/useRememberedDevices";
import DeviceRenameModal from "./DeviceRenameModal";
import DeviceDeleteConfirmModal from "./DeviceDeleteConfirmModal";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import { useState, useEffect } from "react";

function IpLocationDisplay({ ipAddress }) {
    const [location, setLocation] = useState(ipAddress);
    
    useEffect(() => {
        if (!ipAddress || ipAddress.startsWith("127.") || ipAddress.startsWith("192.168.") || ipAddress.startsWith("10.") || ipAddress.startsWith("172.")) {
            return;
        }
        
        fetch(`http://ip-api.com/json/${ipAddress}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success" && data.city && data.country) {
                    setLocation(`${data.city}, ${data.country}`);
                }
            })
            .catch(() => {});
    }, [ipAddress]);

    return (
        <span className="text-muted-foreground text-xs text-slate-500 dark:text-slate-400 text-right leading-tight break-all">
            {location}
        </span>
    );
}

function DevicesIllustration() {
    return (
        <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Desktop Monitor */}
            <rect x="50" y="30" width="80" height="50" rx="4" className="stroke-[#7b0d15]/40 dark:stroke-yellow-400/40" strokeWidth="2" />
            <path d="M75 80 L70 95 L110 95 L105 80" className="fill-[#7b0d15]/20 dark:fill-yellow-400/20" />
            <rect x="60" y="95" width="60" height="4" rx="2" className="fill-[#7b0d15]/40 dark:fill-yellow-400/40" />

            {/* Mobile Phone (overlapping) */}
            <rect x="110" y="45" width="30" height="50" rx="6" className="fill-white dark:fill-[#0a0a0a] stroke-[#7b0d15] dark:stroke-yellow-400" strokeWidth="2" />
            <circle cx="125" cy="88" r="2" className="fill-[#7b0d15] dark:fill-yellow-400" />
            
            {/* Connection signals */}
            <path d="M145 60 Q155 55 160 60" className="stroke-[#7b0d15]/30 dark:stroke-yellow-400/30" strokeWidth="2" strokeLinecap="round" />
            <path d="M148 50 Q162 42 168 50" className="stroke-[#7b0d15]/30 dark:stroke-yellow-400/30" strokeWidth="2" strokeLinecap="round" />
            <path d="M151 40 Q169 29 176 40" className="stroke-[#7b0d15]/30 dark:stroke-yellow-400/30" strokeWidth="2" strokeLinecap="round" />

            {/* Decorative dots */}
            <circle cx="30" cy="50" r="2" className="fill-[#7b0d15]/20 dark:fill-yellow-400/20" />
            <circle cx="40" cy="80" r="3" className="fill-[#7b0d15]/15 dark:fill-yellow-400/15" />
            <circle cx="180" cy="80" r="2" className="fill-[#7b0d15]/20 dark:fill-yellow-400/20" />
        </svg>
    );
}

function formatDeviceDate(value) {
    if (!value) return "Never";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return formatTimestamp(date.toISOString());
}

export default function RememberedDevices({ isProfileLoading = false }) {
    const {
        devices,
        isLoading,
        errorMessage,
        cooldown,

        isRenameModalOpen,
        pendingRenameDevice,
        isRenaming,
        handleRenameClick,
        handleRenameSave,
        handleRenameCancel,

        deletingId,
        pendingDeleteDevice,
        handleDeleteClick,
        handleConfirmDelete,
        handleCancelDelete,
    } = useRememberedDevices({ isProfileLoading });

    const getDeviceIcon = (userAgent) => {
        const ua = (userAgent || "").toLowerCase();
        if (ua.includes("ipad") || (ua.includes("android") && !ua.includes("mobile"))) {
            return <Tablet className="size-14" strokeWidth={1.5} />;
        }
        if (ua.includes("iphone") || ua.includes("android") || ua.includes("mobile")) {
            return <Smartphone className="size-14" strokeWidth={1.5} />;
        }
        return <Monitor className="size-14" strokeWidth={1.5} />;
    };

    const renderDeviceCard = (device) => (
        <Card key={device.id} className="w-full overflow-hidden p-0 relative group shadow-sm bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 transition-all duration-300 h-full flex flex-col">
            <CardContent className="flex flex-col items-center p-0 h-full flex-1">
                <div className="flex w-full flex-col items-center justify-center bg-gradient-to-b from-[#7b0d15]/10 dark:from-yellow-400/20 to-transparent py-10 rounded-t-xl shrink-0 relative">
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                            <ShieldCheck className="w-3 h-3" /> Remembered
                        </span>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-1">
                        <button type="button" className="w-8 h-8 inline-flex items-center justify-center text-[#7b0d15] hover:bg-[#7b0d15]/10 dark:text-yellow-400 dark:hover:bg-yellow-400/20 rounded-full transition-colors disabled:opacity-50" onClick={() => handleRenameClick(device)} disabled={isRenaming || cooldown > 0} aria-label="Rename device">
                            <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button type="button" className="w-8 h-8 inline-flex items-center justify-center text-[#7b0d15] hover:bg-[#7b0d15]/10 dark:text-yellow-400 dark:hover:bg-yellow-400/20 rounded-full transition-colors disabled:opacity-50" onClick={() => handleDeleteClick(device)} disabled={deletingId === device.id || cooldown > 0} aria-label="Remove device">
                            <Trash className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="relative mb-4 mt-6">
                        <div className="absolute inset-0 scale-150 rounded-full bg-[#7b0d15]/10 dark:bg-yellow-400/20 blur-2xl" />
                        <span className="relative block text-[#7b0d15] dark:text-yellow-400">
                            {getDeviceIcon(device.userAgent || device.user_agent)}
                        </span>
                    </div>
                    
                    <h3 className="text-foreground text-lg font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[80%] px-2">
                        {device.name || "Unknown Device"}
                    </h3>
                    <p className="text-muted-foreground text-xs text-center font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 px-4 max-w-[90%]" title={device.userAgent || device.user_agent}>
                        {device.userAgent || device.user_agent || "Unknown Browser"}
                    </p>
                </div>

                <div className="w-full space-y-1 px-3 pb-6 mt-auto">
                    {device.ipAddress && (
                        <div className="rounded-lg flex items-center justify-between px-2 sm:px-3 py-2.5 gap-2 min-h-[44px] bg-slate-100/60 dark:bg-[#0a0a0a] border border-transparent dark:border-white/10">
                            <span className="flex items-center gap-2 text-foreground text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                <Globe className="text-slate-400 dark:text-slate-500 w-4 h-4" /> Registered
                            </span>
                            <IpLocationDisplay ipAddress={device.ipAddress} />
                        </div>
                    )}
                    <div className="rounded-lg flex items-center justify-between px-2 sm:px-3 py-2.5 gap-2 min-h-[44px]">
                        <span className="flex items-center gap-2 text-foreground text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <CalendarDays className="text-slate-400 dark:text-slate-500 w-4 h-4" /> Added
                        </span>
                        <span className="text-muted-foreground text-xs text-slate-500 dark:text-slate-400 text-right leading-tight whitespace-pre-wrap">
                            {formatDeviceDate(device.createdAt || device.created_at)}
                        </span>
                    </div>
                    <div className="rounded-lg flex items-center justify-between px-2 sm:px-3 py-2.5 gap-2 min-h-[44px] bg-slate-100/60 dark:bg-[#0a0a0a] border border-transparent dark:border-white/10">
                        <span className="flex items-center gap-2 text-foreground text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <Clock className="text-slate-400 dark:text-slate-500 w-4 h-4" /> Expires
                        </span>
                        <span className="text-muted-foreground text-xs text-slate-500 dark:text-slate-400 text-right leading-tight whitespace-pre-wrap">
                            {formatDeviceDate(device.expiresAt || device.expires_at)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Card className="py-0 bg-white dark:bg-[#0a0a0a] shadow-sm border border-transparent dark:border-white/10 rounded-3xl ring-0 ring-offset-0 transition-colors duration-300">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2 px-6 sm:px-10 pt-6 sm:pt-10 rounded-t-3xl bg-transparent">
                    <div>
                        <CardTitle className="text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">REMEMBERED DEVICES</CardTitle>
                        <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">Devices that skip multi-factor authentication when you sign in.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 lg:p-8">

                    {errorMessage && (
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
                            {cooldown > 0 && errorMessage === "Too many attempts. Please wait." 
                                ? `Too many attempts. Please wait ${cooldown}s.` 
                                : errorMessage}
                        </p>
                    )}

                    {isLoading ? (
                        <div className="w-full min-w-0 relative px-0 sm:px-12">
                            <div className="flex -ml-2 overflow-hidden">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/3 pl-2">
                                        <div className="p-1 h-[440px]">
                                            <Card className="w-full overflow-hidden p-0 relative group shadow-sm bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 transition-all duration-300 h-full flex flex-col">
                                                <CardContent className="flex flex-col items-center p-0 h-full flex-1">
                                                    <div className="flex w-full flex-col items-center justify-center py-10 rounded-t-xl shrink-0">
                                                        <Skeleton className="h-16 w-16 rounded-full mb-6" />
                                                        <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
                                                        <Skeleton className="h-4 w-1/2 rounded-md" />
                                                    </div>
                                                    <div className="w-full space-y-2 px-3 pb-6 mt-auto">
                                                        <Skeleton className="h-[44px] w-full rounded-lg" />
                                                        <Skeleton className="h-[44px] w-full rounded-lg" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {devices.length > 0 ? (
                                <Carousel
                                    opts={{
                                        align: "start",
                                    }}
                                    className="w-full min-w-0 relative px-0 sm:px-12"
                                >
                                    <CarouselContent className="-ml-2">
                                        {devices.map((device) => (
                                            <CarouselItem key={device.id} className="sm:basis-1/2 lg:basis-1/3 pl-2">
                                                <div className="p-1 h-[440px]">
                                                    {renderDeviceCard(device)}
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="hidden sm:inline-flex left-0 bg-[#7b0d15] dark:bg-yellow-400 hover:bg-yellow-400 dark:hover:bg-[#7b0d15] text-white dark:text-[#7b0d15] hover:text-[#7b0d15] dark:hover:text-yellow-400 border-none" />
                                    <CarouselNext className="hidden sm:inline-flex right-0 bg-[#7b0d15] dark:bg-yellow-400 hover:bg-yellow-400 dark:hover:bg-[#7b0d15] text-white dark:text-[#7b0d15] hover:text-[#7b0d15] dark:hover:text-yellow-400 border-none" />
                                </Carousel>
                            ) : (
                                !errorMessage && (
                                    <div className="flex items-center justify-center p-4">
                                        <Empty className="py-12">
                                            <EmptyHeader>
                                                <EmptyMedia>
                                                    <DevicesIllustration />
                                                </EmptyMedia>
                                                <EmptyTitle>No remembered devices</EmptyTitle>
                                                <EmptyDescription>
                                                    When you sign in, check the "Remember this device" box to skip MFA.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <DeviceRenameModal
                device={pendingRenameDevice}
                isOpen={isRenameModalOpen}
                isRenaming={isRenaming}
                onClose={handleRenameCancel}
                onSave={handleRenameSave}
            />

            <DeviceDeleteConfirmModal
                device={pendingDeleteDevice}
                isDeleting={Boolean(deletingId)}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
