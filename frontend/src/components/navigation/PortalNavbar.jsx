import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePortalTheme } from "../../providers/PortalThemeProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon, MenuIcon, XIcon, LayoutDashboard, User, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PAGE_TRANSITION_MS = 240;

export default function PortalNavbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const navigationTimeoutRef = useRef(0);
    const { isDarkMode, toggleTheme } = usePortalTheme();
    const isProfilePage = location.pathname === "/profile";
    const firstOption = isProfilePage ? "Dashboard" : "Profile";
    const themeLabel = isDarkMode ? "Switch to light mode" : "Switch to dark mode";

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navigateWithPageFade = (path) => {
        if (location.pathname === path) {
            return;
        }

        const currentPage = document.querySelector(".portal-home, .profile-page");
        currentPage?.classList.add("is-leaving");
        window.clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = window.setTimeout(() => navigate(path), PAGE_TRANSITION_MS);
    };

    const handleFirstOption = () => {
        setDropdownOpen(false);
        navigateWithPageFade(isProfilePage ? "/portal" : "/profile");
    };

    const handleLogout = () => {
        setDropdownOpen(false);
        navigate("/logout");
    };

    const handleThemeToggle = () => {
        if (document.startViewTransition) {
            document.startViewTransition(toggleTheme);
            return;
        }
        toggleTheme();
    };

    useEffect(() => {
        return () => window.clearTimeout(navigationTimeoutRef.current);
    }, []);

    return (
        <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
            <div className="flex items-center justify-between px-4 md:px-8 max-w-[1400px] mx-auto h-20 md:h-24">
                <div className="flex items-center gap-2.5 md:gap-4">
                    <Avatar className="w-8 h-8 md:w-12 md:h-12 drop-shadow-md">
                        <AvatarImage src="/assets/images/PUPlogo.png" alt="PUP Logo" className="object-contain" />
                        <AvatarFallback>PUP</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                        <div className="text-sm md:text-lg font-black tracking-tight text-orange-50 uppercase leading-tight">ONE PORTAL</div>
                        <div className="hidden md:block text-xs font-bold text-orange-50/80">
                            POLYTECHNIC UNIVERSITY OF THE PHILIPPINES - TAGUIG CAMPUS
                        </div>
                    </div>
                </div>

                <div className="relative flex items-center gap-3">
                    <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white transition-colors" onClick={handleThemeToggle} aria-label={themeLabel}>
                        <SunIcon className={cn(
                            "size-5 transition-all duration-300",
                            isDarkMode
                                ? "scale-0 -rotate-90 opacity-0"
                                : "scale-100 rotate-0 opacity-100"
                        )} />
                        <MoonIcon className={cn(
                            "absolute size-5 transition-all duration-300",
                            isDarkMode
                                ? "scale-100 rotate-0 opacity-100"
                                : "scale-0 rotate-90 opacity-0"
                        )} />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="outline" className={cn("w-10 h-10 rounded-xl transition-colors border-white/20 outline-none ring-0", dropdownOpen ? "bg-white/20 text-white ring-2 ring-white/50 ring-offset-0" : "bg-white/10 text-white hover:bg-white/20")} aria-label={dropdownOpen ? "Close menu" : "Open menu"}>
                                <span className="relative flex size-5 items-center justify-center">
                                    <MenuIcon aria-hidden="true" className={cn(
                                        "absolute size-5 transition-all duration-200",
                                        dropdownOpen
                                            ? "scale-75 rotate-90 opacity-0"
                                            : "scale-100 rotate-0 opacity-100"
                                    )} />
                                    <XIcon aria-hidden="true" className={cn(
                                        "absolute size-5 transition-all duration-200",
                                        dropdownOpen
                                            ? "scale-100 rotate-0 opacity-100"
                                            : "scale-75 -rotate-90 opacity-0"
                                    )} />
                                </span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="font-[Poppins] w-48 p-1.5 mt-2 rounded-2xl bg-[#2a050a]/95 border border-white/10 shadow-[0_18px_42px_rgba(0,0,0,0.26)] backdrop-blur-md ring-0 outline-none">
                            <DropdownMenuItem onClick={handleFirstOption} className="group px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-orange-50/90 focus:bg-white/10 focus:text-orange-50 data-[highlighted]:bg-white/10 data-[highlighted]:text-orange-50">
                                {firstOption === "Dashboard" ? <LayoutDashboard className="mr-3 w-5 h-5" style={{ color: "inherit" }} /> : <User className="mr-3 w-5 h-5" style={{ color: "inherit" }} />}
                                {firstOption}
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={handleLogout} className="group px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-red-400 focus:bg-white/10 focus:text-red-300 data-[highlighted]:bg-white/10 data-[highlighted]:text-red-300">
                                <LogOut className="mr-3 w-5 h-5" style={{ color: "inherit" }} />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
