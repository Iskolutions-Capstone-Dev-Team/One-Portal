import { useState, useEffect } from "react";
import { Info, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GradientWaves from "@/components/ui/GradientWaves";

export default function PortalHero({ children }) {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <section className="relative z-20 flex items-center justify-center min-h-[45vh] md:min-h-[55vh] overflow-hidden pt-16 md:pt-20 pb-12 md:pb-20 -mb-12 md:-mb-20 pointer-events-none">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#2a050a] from-50% to-transparent">
                <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{ 
                        maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 45%, black 65%, black 100%)', 
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 45%, black 65%, black 100%)' 
                    }}
                >
                    <div className="absolute inset-0 scale-y-[-1] overflow-hidden">
                        <GradientWaves
                            className={isDesktop ? "scale-x-[2.5]" : "scale-x-[1.5]"}
                            horizonColor="#f1f5f9"
                            waveColor="#4f0d17"
                            crestColor="#230407"
                            speed={0.15}
                            amplitude={2.5}
                            waveScale={isDesktop ? 1.5 : 0.9}
                            waveRatio={0.9}
                            swell={35}
                            turbulence={20}
                            tilt={1.11}
                            zoom={1}
                            height={isDesktop ? 12.0 : 14.0}
                            fogDepth={40}
                        detail="medium"
                        brightness={1}
                        opacity={1}
                        mouseInteraction={true}
                        parallaxStrength={0.5}
                        grain={true}
                        grainIntensity={0.05}
                    />
                </div>
                </div>
            </div>

            {/* Content */}
            <motion.div 
                className="relative z-10 w-full max-w-4xl px-4 -mt-4 md:-mt-8 pt-8 md:pt-12 pb-16 md:pb-20 text-center text-white pointer-events-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex justify-center mb-3">
                    <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5 bg-black/40 text-white border-white/20 backdrop-blur-md rounded-lg shadow-sm">
                        <Avatar className="w-5 h-5 bg-transparent rounded-none">
                            <AvatarImage src="/assets/images/PUPlogo.png" alt="PUP Taguig Seal" className="object-contain" />
                            <AvatarFallback>PUP</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm md:text-base tracking-wide pr-1">One Portal</span>
                    </Badge>
                </div>

                <h1 className="scroll-m-20 text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight mb-8 drop-shadow-lg text-white max-w-4xl mx-auto leading-tight">
                    Online Repository for <span className="text-yellow-400">PUP Taguig Systems</span>
                </h1>
                
                <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full px-4" aria-label="Portal shortcuts">
                    <Button asChild className="bg-transparent text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#4f0d17] min-h-0 md:min-h-[2.65rem] px-2.5 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-extrabold text-xs md:text-[0.9rem] shadow-lg transition-all hover:-translate-y-[1px] h-auto cursor-pointer">
                        <a href="#portal-systems" className="flex flex-row items-center justify-center gap-1.5 md:gap-2">
                            <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Explore Services
                        </a>
                    </Button>
                    <Button asChild className="bg-[#6b1115] text-white hover:bg-yellow-400 hover:text-[#4f0d17] border border-[#6b1115]/70 hover:border-yellow-400 min-h-0 md:min-h-[2.65rem] px-2.5 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-extrabold text-xs md:text-[0.9rem] shadow-lg transition-all hover:-translate-y-[1px] h-auto cursor-pointer">
                        <a href="#portal-footer" className="flex flex-row items-center justify-center gap-1.5 md:gap-2">
                            <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Learn More
                        </a>
                    </Button>
                </div>
                {children}
            </motion.div>
        </section>
    );
}