import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRef, useState, useEffect } from "react";

function TruncatedText({ text, as: Component = "h3", className }) {
    const textRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        const checkTruncation = () => {
            if (textRef.current) {
                const el = textRef.current;
                // Detects overflow for single-line (scrollWidth) and multi-line (scrollHeight)
                setIsTruncated(
                    el.scrollWidth > el.clientWidth || 
                    el.scrollHeight > el.clientHeight + 1
                );
            }
        };
        
        checkTruncation();
        const timeout1 = setTimeout(checkTruncation, 100);
        const timeout2 = setTimeout(checkTruncation, 500);
        
        window.addEventListener('resize', checkTruncation);
        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            window.removeEventListener('resize', checkTruncation);
        };
    }, [text]);

    return (
        <Tooltip 
            open={isTruncated && (isHovered || isClicked)} 
            onOpenChange={(open) => setIsHovered(open)}
        >
            <TooltipTrigger asChild>
                <Component 
                    ref={textRef} 
                    className={`${className} ${isTruncated ? 'cursor-help' : ''}`}
                    onClick={(e) => {
                        if (isTruncated) {
                            e.preventDefault();
                            setIsClicked(prev => !prev);
                        }
                    }}
                >
                    {text}
                </Component>
            </TooltipTrigger>
            {isTruncated && (
                <TooltipContent side="top" className="max-w-xs z-50" onPointerDownOutside={() => setIsClicked(false)}>
                    <p className="text-sm break-all whitespace-normal text-center">{text}</p>
                </TooltipContent>
            )}
        </Tooltip>
    );
}

export default function SystemCard({ system }) {
    const fallbackBackgroundImage = "/assets/images/system_card_clear.png";
    const fallbackLogoImage = "/assets/images/PUPlogo.png";
    const cardLogo = system.logo?.trim() || fallbackLogoImage;
    const accessLink = system.link?.trim() || "";
    const isAccessDisabled = !accessLink;
    const systemName = system.title?.trim() || "Untitled system";
    const description = typeof system.description === "string"
        ? system.description.trim()
        : "";
    const hasDescription = Boolean(description);

    return (
        <TooltipProvider delayDuration={100}>
            {/* Desktop / Tablet Layout */}
            <div className={`hidden md:flex justify-center w-full h-full ${isAccessDisabled ? 'opacity-80' : ''}`}>
                <Card className="group/card w-full max-w-xs p-0 overflow-hidden border-0 rounded-3xl bg-zinc-950 flex flex-col h-full relative">
                    {/* Background Images covering the whole card */}
                    <img
                        src={system.imageBlur || fallbackBackgroundImage}
                        alt=""
                        className="absolute inset-0 size-full object-cover transition-all duration-700 group-hover/card:scale-110 filter brightness-75 z-0"
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = fallbackBackgroundImage;
                        }}
                    />
                    <img
                        src={system.imageClear || fallbackBackgroundImage}
                        alt="Background"
                        className="absolute inset-0 size-full object-cover transition-all duration-700 scale-100 group-hover/card:scale-110 opacity-0 group-hover/card:opacity-100 filter brightness-[0.4] z-0"
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = fallbackBackgroundImage;
                        }}
                    />

                    {/* Gradient overlay mimicking Image 2's lower half fade */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none z-10" />

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 z-20 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transition-transform duration-1000 group-hover/card:translate-x-[150%] pointer-events-none" />

                    <CardContent className="flex flex-col gap-0 p-0 h-full relative z-20">
                        {/* Top half: Logo centered in the top space */}
                        <div className="relative h-48 w-full shrink-0 flex items-center justify-center pointer-events-none transition-transform duration-500 group-hover/card:-translate-y-2">
                            <div className="relative">
                                {/* Logo Glow */}
                                <div className="absolute inset-0 scale-150 rounded-full bg-[#6b1115]/30 blur-2xl transition-opacity duration-700 opacity-100 group-hover/card:opacity-0" />
                                <img 
                                    src={cardLogo} 
                                    alt={`${systemName} logo`} 
                                    className="relative w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-2xl" 
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackLogoImage; }}
                                />
                            </div>
                        </div>

                        {/* Lower half: Content */}
                        <div className="flex flex-col gap-2 p-6 flex-1 text-center justify-end pb-8 min-w-0 w-full relative z-30">
                            <div className="flex flex-col gap-2 items-center w-full min-w-0">
                                <TruncatedText 
                                    text={systemName} 
                                    as="h3" 
                                    className="text-lg md:text-xl font-bold text-white tracking-tight truncate text-center w-full max-w-full" 
                                />
                                
                                {hasDescription && (
                                    <TruncatedText 
                                        text={description} 
                                        as="p" 
                                        className="text-xs md:text-sm text-zinc-300 line-clamp-2 text-center w-full max-w-full break-all" 
                                    />
                                )}
                            </div>
                            
                            {/* Action Button */}
                            <div className="pt-4 w-full flex justify-center mt-2">
                                <Button variant={isAccessDisabled ? "outline" : "default"} className={`group/sliding relative overflow-hidden w-fit px-5 md:px-7 h-9 md:h-10 text-xs md:text-sm font-extrabold rounded-lg md:rounded-xl shadow-lg transition-all cursor-pointer ${!isAccessDisabled ? 'bg-transparent text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#4f0d17] hover:-translate-y-[1px]' : ''}`} asChild>
                                    <a href={isAccessDisabled ? undefined : accessLink}target={isAccessDisabled ? undefined : "_blank"} rel={isAccessDisabled ? undefined : "noreferrer"} onClick={(e) => isAccessDisabled && e.preventDefault()} className="flex items-center justify-center">
                                        <span className={!isAccessDisabled ? "inline-flex items-center transition-transform duration-300 lg:group-hover/sliding:-translate-x-2" : ""}>
                                            {isAccessDisabled ? "Unavailable" : "Access"}
                                        </span>
                                        {!isAccessDisabled && (
                                            <>
                                                {/* Arrow that slides in on Desktop/Laptop (lg and above) */}
                                                <ArrowRightIcon className="hidden lg:block absolute right-2.5 translate-x-8 opacity-0 transition-all duration-300 lg:group-hover/sliding:translate-x-0 lg:group-hover/sliding:opacity-100 w-4 h-4" aria-hidden="true" />
                                                {/* Static arrow for Tablet (md only) */}
                                                <ArrowRightIcon className="hidden md:block lg:hidden ml-1.5 w-3.5 h-3.5" aria-hidden="true" />
                                            </>
                                        )}
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile Layout (Horizontal Item) */}
            <div className={`md:hidden block w-full group/mobile relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 ${isAccessDisabled ? 'opacity-80' : ''} shadow-sm bg-zinc-950`}>
                {/* Background Image for mobile */}
                <img
                    src={system.imageBlur || fallbackBackgroundImage}
                    alt=""
                    className="absolute inset-0 size-full object-cover filter brightness-75 z-0"
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackBackgroundImage;
                    }}
                />

                {/* Dark gradient overlay on the right side mimicking desktop's bottom fade */}
                <div className="absolute inset-y-0 right-0 w-3/4 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none z-10" />

                <div className="relative z-10 flex items-center justify-between gap-3 p-4">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center justify-center">
                        <img src={cardLogo} alt={`${systemName} logo`} className="w-12 h-12 object-contain drop-shadow-lg" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackLogoImage; }}/>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 min-w-0 pr-2 text-left">
                        <TruncatedText 
                            text={systemName} 
                            as="h4" 
                            className="text-sm font-semibold text-white truncate text-left block w-full" 
                        />
                    </div>

                    {/* Action Button */}
                    <Button variant={isAccessDisabled ? "outline" : "default"} size="sm" className={`flex-shrink-0 h-8 px-4 text-xs font-extrabold rounded-lg md:rounded-xl shadow-lg transition-all cursor-pointer ${!isAccessDisabled ? 'bg-transparent text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#4f0d17] hover:-translate-y-[1px]' : ''}`} asChild>
                        <a href={isAccessDisabled ? undefined : accessLink} target={isAccessDisabled ? undefined : "_blank"} rel={isAccessDisabled ? undefined : "noreferrer"} onClick={(e) => isAccessDisabled && e.preventDefault()} className="flex items-center">
                            <span>{isAccessDisabled ? "Unavailable" : "Access"}</span>
                            {!isAccessDisabled && <ArrowRightIcon className="ml-1 w-3 h-3" />}
                        </a>
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    );
}