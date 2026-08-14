import { useEffect, useState } from "react";
import ContactUs from "./ContactUs";
import WebAccessibility from "../../features/accessibility/components/WebAccessibility";
import "../../features/accessibility/components/WebAccessibility";

const MENU_TRANSITION_DURATION_MS = 220;
function getMenuTransitionDuration() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return MENU_TRANSITION_DURATION_MS;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : MENU_TRANSITION_DURATION_MS;
}

function PlusIcon({ isOpen }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-250 ${isOpen ? "rotate-45 text-yellow-200" : "text-yellow-400"}`} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export default function FloatingActionMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [activeFloatingPanel, setActiveFloatingPanel] = useState(null);
  const toggleLabel = isMenuOpen
    ? "Close quick actions"
    : "Open quick actions";

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuMounted(true);
      return undefined;
    }

    if (!isMenuMounted) {
      return undefined;
    }

    const closeTimeoutId = window.setTimeout(() => {
      setIsMenuMounted(false);
    }, getMenuTransitionDuration());

    return () => {
      window.clearTimeout(closeTimeoutId);
    };
  }, [isMenuOpen, isMenuMounted]);

  const handleMenuToggle = () => {
    if (isMenuOpen) {
      setActiveFloatingPanel(null);
      setIsMenuOpen(false);
      return;
    }

    setIsMenuOpen(true);
  };

  const toggleFloatingPanel = (panelName) => {
    setIsMenuOpen(true);
    setActiveFloatingPanel((currentPanel) => (
      currentPanel === panelName ? null : panelName
    ));
  };

  const closeFloatingPanel = (panelName) => {
    setActiveFloatingPanel((currentPanel) => (
      currentPanel === panelName ? null : currentPanel
    ));
  };

  const handleContactClick = () => {
    setActiveFloatingPanel(null);
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed right-3 bottom-[max(0.85rem,env(safe-area-inset-bottom))] sm:right-4 sm:bottom-4 md:right-8 md:bottom-8 z-[44] flex flex-col items-end gap-3 sm:gap-3.5 pointer-events-none">
      <WebAccessibility
        isMenuOpen={isMenuOpen}
        isButtonVisible={isMenuMounted}
        onActivate={() => setActiveFloatingPanel(null)}
      />

      {isMenuMounted ? (
        <div className={`flex flex-col items-end gap-3 sm:gap-3.5 will-change-[opacity,transform] ${isMenuOpen ? "animate-in fade-in slide-in-from-bottom-2 duration-200" : "animate-out fade-out slide-out-to-bottom-2 duration-200 pointer-events-none"}`}>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-220 delay-100 fill-mode-both">
            <ContactUs onClick={handleContactClick} />
          </div>
        </div>
      ) : null}

      <button type="button" className="relative grid place-items-center w-[3.65rem] h-[3.65rem] sm:w-[4.2rem] sm:h-[4.2rem] border border-yellow-400/30 rounded-full text-orange-50 bg-gradient-to-br from-[#c32929] via-[#991b1b] to-[#7f1d1d] shadow-[10px_10px_18px_rgba(153,27,27,0.16),-3px_-3px_8px_rgba(255,255,255,0.14),inset_1px_1px_0_rgba(255,255,255,0.08)] dark:shadow-[10px_10px_18px_rgba(8,12,18,0.28),-4px_-4px_8px_rgba(255,255,255,0.04),inset_1px_1px_0_rgba(255,255,255,0.14)] cursor-pointer pointer-events-auto transition-all duration-250 ease-in-out hover:-translate-y-1 hover:shadow-[12px_12px_20px_rgba(153,27,27,0.18),-3px_-3px_8px_rgba(255,255,255,0.16),inset_1px_1px_0_rgba(255,255,255,0.1)] dark:hover:shadow-[12px_12px_20px_rgba(8,12,18,0.32),-4px_-4px_8px_rgba(255,255,255,0.06),inset_1px_1px_0_rgba(255,255,255,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-800/40" aria-expanded={isMenuOpen} aria-label={toggleLabel} onClick={handleMenuToggle}>

        <PlusIcon isOpen={isMenuOpen} />
      </button>
    </div>
  );
}
