import { Menu, House, Star, MessageCircleQuestionMark, LogIn, UserPlus } from "lucide-react";
import { navItems } from "../constants/landingContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import InstallPWAButton from "@/components/InstallPWAButton";

export default function LandingNavbar({ pendingAction, onLoginClick, onRegisterClick }) {
    const getNavIcon = (label) => {
        switch (label) {
            case "Home": return <House className="w-4 h-4" />;
            case "Features": return <Star className="w-4 h-4" />;
            case "FAQ": return <MessageCircleQuestionMark className="w-4 h-4" />;
            default: return null;
        }
    };

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between gap-4 min-h-[4.6rem] py-3 px-5 md:px-16 bg-transparent w-full">
            <div className="flex items-center gap-3">
                <div className="lg:hidden">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="w-10 h-10 rounded-xl text-orange-50 bg-transparent hover:bg-white/10 p-0 m-0 [&>svg:last-child]:hidden cursor-pointer border-0">
                                    <Menu className="w-5 h-5" />
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="bg-[#2a050a]/95 border border-white/10 rounded-[0.85rem] shadow-[0_18px_42px_rgba(0,0,0,0.26)]">
                                    <ul className="grid w-52 gap-1 p-2">
                                        {navItems.map((item) => (
                                            <li key={item.href}>
                                                <NavigationMenuLink asChild>
                                                    <a href={item.href} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/10 hover:text-orange-50 font-medium text-[0.9rem] transition-colors text-orange-50/80">
                                                        {getNavIcon(item.label)}
                                                        {item.label}
                                                    </a>
                                                </NavigationMenuLink>
                                            </li>
                                        ))}
                                        <li>
                                            <InstallPWAButton asMenuItem />
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <a href="#home" className="flex items-center gap-1.5 md:gap-2.5 text-orange-50 text-xs md:text-base font-extrabold uppercase no-underline">
                    <Avatar className="w-6 h-6 md:w-8 md:h-8 drop-shadow-md">
                        <AvatarImage src="/assets/images/PUPlogo.png" alt="PUP Logo" className="object-contain" />
                        <AvatarFallback>PUP</AvatarFallback>
                    </Avatar>
                    <span className="leading-tight">ONE PORTAL</span>
                </a>
            </div>

            <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center" aria-label="Landing sections">
                <ul className="flex items-center gap-1.5 m-0 p-0 list-none">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Button variant="ghost" asChild className="text-orange-50/80 hover:bg-white/10 hover:text-orange-50 font-bold min-h-[2.4rem] px-3.5 py-2 rounded-[0.6rem] text-[0.9rem] h-auto border-0 gap-2">
                                <a href={item.href} className="inline-flex items-center gap-2">
                                    {getNavIcon(item.label)}
                                    {item.label}
                                </a>
                            </Button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="flex items-center justify-end gap-1.5 md:gap-3">
                <InstallPWAButton className="hidden lg:flex bg-transparent text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#4f0d17] min-h-0 md:min-h-[2.65rem] px-2.5 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-extrabold text-xs md:text-[0.9rem] shadow-lg transition-all hover:-translate-y-[1px] h-auto cursor-pointer" />
                
                <Button className="bg-yellow-400 text-[#4f0d17] hover:bg-[#6b1115] hover:text-yellow-400 border border-yellow-400/70 hover:border-yellow-400/90 min-h-0 md:min-h-[2.65rem] px-2.5 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-extrabold text-xs md:text-[0.9rem] shadow-lg transition-all hover:-translate-y-[1px] h-auto gap-1.5 md:gap-2 cursor-pointer" onClick={onLoginClick} disabled={Boolean(pendingAction)}>
                    <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
                    {pendingAction === "login" ? "Opening..." : "Login"}
                </Button>
            </div>
        </header>
    );
}
