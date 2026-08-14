import { Mail } from "lucide-react";

const CONTACT_EMAIL_LINK = "mailto:iskolutions.team@gmail.com";

export default function ContactUs({ onClick }) {
  return (
    <div className="relative">
      <div className="group/tooltip relative flex items-center justify-end w-[3.65rem] h-[3.65rem] sm:w-[4.2rem] sm:h-[4.2rem] pointer-events-auto">
        <a href={CONTACT_EMAIL_LINK} className="relative grid place-items-center w-full h-full border border-yellow-400/30 rounded-full text-orange-50 bg-gradient-to-br from-[#c32929] via-[#991b1b] to-[#7f1d1d] shadow-[10px_10px_18px_rgba(153,27,27,0.16),-3px_-3px_8px_rgba(255,255,255,0.14),inset_1px_1px_0_rgba(255,255,255,0.08)] dark:shadow-[10px_10px_18px_rgba(8,12,18,0.28),-4px_-4px_8px_rgba(255,255,255,0.04),inset_1px_1px_0_rgba(255,255,255,0.14)] cursor-pointer transition-all duration-250 ease-in-out hover:-translate-y-1 hover:shadow-[12px_12px_20px_rgba(153,27,27,0.18),-3px_-3px_8px_rgba(255,255,255,0.16),inset_1px_1px_0_rgba(255,255,255,0.1)] dark:hover:shadow-[12px_12px_20px_rgba(8,12,18,0.32),-4px_-4px_8px_rgba(255,255,255,0.06),inset_1px_1px_0_rgba(255,255,255,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-800/40" aria-label="Contact us by email" onClick={onClick}>
          <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 transition-all duration-250" strokeWidth={2.5} />
        </a>

        <span className="absolute top-1/2 right-[calc(100%+0.85rem)] z-10 px-3 py-2 border border-white/80 dark:border-slate-400/20 rounded-full bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-700 dark:to-slate-800 shadow-[12px_12px_24px_rgba(171,179,191,0.2),-4px_-4px_10px_rgba(255,255,255,0.26),inset_1px_1px_0_rgba(255,255,255,0.44)] dark:shadow-[14px_14px_28px_rgba(8,12,18,0.34),-6px_-6px_12px_rgba(255,255,255,0.03),inset_1px_1px_0_rgba(255,255,255,0.06)] text-slate-700 dark:text-slate-100 text-xs font-bold whitespace-nowrap pointer-events-none opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible transition-all duration-200 translate-x-1 group-hover/tooltip:translate-x-0 group-focus-within/tooltip:translate-x-0 -translate-y-1/2" aria-hidden="true">
          Contact Us
          {/* Tooltip arrow */}
          <span className="absolute top-1/2 -right-1 w-2.5 h-2.5 border-t border-r border-white/80 dark:border-slate-400/20 rounded-tr-sm bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rotate-45"></span>
        </span>
      </div>
    </div>
  );
}
