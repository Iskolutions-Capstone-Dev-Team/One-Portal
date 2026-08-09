import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import { House, UserPlus, GraduationCap, Landmark, CalendarRange, Users } from "lucide-react";
import Lanyard from "@/components/Lanyard";
import { motion } from "framer-motion";

function FloatingIcon({ children, className, rotate = "0deg", style }) {
    const delay = parseFloat(style?.animationDelay || '0');
    
    return (
        <div className={`absolute z-0 ${className}`} style={{ transform: `rotate(${rotate})` }}>
            <motion.div
                animate={{ y: [-15, 15, -15] }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay
                }}
            >
                <IconTile 
                    className="transition-transform duration-1000" 
                    style={{
                        '--icon-tile-size': '4.25rem',
                        '--icon-tile-icon-size': '1.8rem'
                    }}
                    aria-hidden="true"
                >
                    {children}
                </IconTile>
            </motion.div>
        </div>
    );
}

function IconTile({ children, className, style, "aria-hidden": ariaHidden }) {
    return (
        <div 
            className={`hidden xl:flex items-center justify-center bg-white/10 border border-white/20 rounded-2xl shadow-lg backdrop-blur-sm ${className}`}
            style={{
                width: 'var(--icon-tile-size, 3rem)',
                height: 'var(--icon-tile-size, 3rem)',
                ...style
            }}
            aria-hidden={ariaHidden}
        >
            <div className="text-white/80 flex items-center justify-center drop-shadow-md" style={{ width: 'var(--icon-tile-icon-size, 1.5rem)', height: 'var(--icon-tile-icon-size, 1.5rem)' }}>
                {children}
            </div>
        </div>
    );
}

export default function HeroSection({ pendingAction, onRegisterClick }) {
    return (
        <section id="home" className="relative grid grid-cols-1 justify-items-center gap-10 md:gap-14 min-h-[calc(100vh-4.6rem)] py-12 md:py-20 px-5 md:px-16 text-center scroll-mt-20">
            <FloatingIcon className="top-[5.6rem] left-[15%]" style={{ animationDelay: '0s' }} rotate="-12deg">
                <GraduationCap />
            </FloatingIcon>
            <FloatingIcon className="top-[17rem] left-[18%]" style={{ animationDelay: '1.4s' }} rotate="15deg">
                <Landmark />
            </FloatingIcon>
            <FloatingIcon className="top-[5rem] right-[17%]" style={{ animationDelay: '0.7s' }} rotate="12deg">
                <CalendarRange />
            </FloatingIcon>
            <FloatingIcon className="top-[16.4rem] right-[18%]" style={{ animationDelay: '2s' }} rotate="-15deg">
                <Users />
            </FloatingIcon>

            <motion.div 
                className="w-full max-w-[42rem] justify-self-center relative z-10 pointer-events-none"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false, amount: 0.2 }}
            >
                <Badge variant="outline" className="mb-4 text-yellow-400 border-yellow-400/40 bg-yellow-400/10 uppercase tracking-[0.12em] font-extrabold px-3.5 py-2 min-h-[2rem] rounded-full shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] gap-2 pointer-events-auto">
                    <House className="w-4 h-4" />
                    Home
                </Badge>
                
                <h1 className="scroll-m-20 text-[clamp(2.8rem,7vw,5.2rem)] leading-[0.95] font-extrabold tracking-tight max-w-[42rem] text-white text-balance drop-shadow-[0_18px_40px_rgba(0,0,0,0.26)] mx-auto pointer-events-auto">
                    Access <span className="text-yellow-400 inline">PUPT</span> Services.
                </h1>
                
                <p className="leading-[1.9] text-[1.02rem] [&:not(:first-child)]:mt-[1.2rem] max-w-[28rem] mx-auto text-orange-50/80 pointer-events-auto">
                    One starting point for campus services.
                </p>

                <div className="mt-8 flex justify-center pointer-events-auto">
                    <Button size="lg" onClick={onRegisterClick} disabled={pendingAction === "register"} className="bg-yellow-400 text-[#4f0d17] hover:bg-[#6b1115] hover:text-yellow-400 border border-yellow-400/70 hover:border-yellow-400/90 rounded-xl font-extrabold px-8 shadow-lg transition-all hover:-translate-y-[1px] min-h-[3rem]">
                        <UserPlus className="w-5 h-5 mr-2" />
                        {pendingAction === "register" ? "Redirecting..." : "Register"}
                    </Button>
                </div>
            </motion.div>

            <div className="absolute w-full left-[50%] -translate-x-[50%] top-[-20vh] z-0 overflow-visible h-[140vh] pointer-events-none">
                <div className="pointer-events-auto h-full w-full">
                    <Lanyard 
                        position={[0, 0, 20]} 
                        gravity={[0, -40, 0]} 
                        frontImage="/assets/images/PUPlogo.png"
                        backImage="/assets/images/pup_bg.png"
                        imageFit="cover"
                    />
                </div>
            </div>
        </section>
    );
}