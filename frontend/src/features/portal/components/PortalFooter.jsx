import { Mail } from "lucide-react";
import { FacebookIcon } from "./portalIcons";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IconTile } from "@/components/reui/icon-tile";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61590127270893",
    icon: <FacebookIcon className="w-5 h-5" />,
  },
  {
    name: "Email",
    href: "mailto:iskolutions.team@gmail.com",
    icon: <Mail className="w-5 h-5" />,
  },
];

const legalLinks = [
  { label: "Privacy Policy", href: "https://www.pup.edu.ph/privacy/" },
  { label: "Terms of Service", href: "https://www.pup.edu.ph/terms/" },
];

export default function PortalFooter() {
  return (
    <footer id="portal-footer" className="relative pt-16 pb-8 px-4 md:px-8 bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <Card className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-8 bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 ring-0 ring-offset-0">
        <aside className="lg:w-[65%]">
          <div className="mb-6">
            <Badge variant="outline" className="flex items-center w-fit gap-2 px-3 py-1.5 bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md shadow-sm transition-colors">
                <Avatar className="w-5 h-5 bg-transparent rounded-none">
                    <AvatarImage src="/assets/images/PUPlogo.png" alt="PUP Taguig Seal" className="object-contain" />
                    <AvatarFallback>PUP</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm md:text-base tracking-wide pr-1">One Portal</span>
            </Badge>
          </div>

          <p className="max-w-2xl text-base text-foreground leading-relaxed mb-6">
            PUPT One Portal is a centralized platform that unifies campus
            services and resources into a single access point, providing a more
            accessible, connected, and convenient experience for the university
            community and its users.
          </p>

          <p className="text-base text-foreground">
            &copy; 2026 <span className="font-bold">Polytechnic University of the Philippines</span>
            <br />
            All rights reserved. PUPT One Portal System
          </p>
        </aside>

        <Separator orientation="vertical" className="hidden lg:block w-px bg-slate-200 dark:bg-slate-700 self-stretch mx-4" />
        <Separator className="lg:hidden" />

        <nav className="lg:w-[35%] flex flex-col justify-center" aria-label="Stay Connected">
          <p className="text-sm font-medium leading-none mb-2 tracking-widest uppercase text-[#7b0d15] dark:text-red-500">
            Stay Connected
          </p>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-1">
            Official PUP Taguig channels
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Follow us for updates
          </p>

          <div className="flex gap-4">
            {socialLinks.map(({ name, href, icon }) => (
              <IconTile
                key={name}
                render={<a href={href} target="_blank" rel="noopener noreferrer" aria-label={name} />}
                variant="elevated"
                className="bg-transparent text-[#7b0d15] dark:text-red-500 border-2 border-[#7b0d15] dark:border-red-500 hover:bg-[#7b0d15] dark:hover:bg-red-500 hover:text-white hover:scale-110 hover:-translate-y-1 focus-visible:ring-ring focus-visible:ring-offset-background transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {icon}
              </IconTile>
            ))}
          </div>
        </nav>
      </Card>

      <div className="relative z-10 max-w-7xl mx-auto mt-12 flex flex-wrap justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        {legalLinks.map((link, index) => (
          <div key={link.label} className="flex items-center">
            {index > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mx-4" aria-hidden="true" />
            )}
            <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-red-700 dark:hover:text-red-400 transition-colors">
              {link.label}
            </a>
          </div>
        ))}
      </div>
    </footer>
  );
}