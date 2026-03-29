import { useState } from "react";
import ContactUs from "./ContactUs";
import NotificationCenter from "./NotificationCenter";
import "../styles/FloatingActionMenu.css";

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="portal-floating-actions__toggle-icon" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export default function FloatingActionMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFloatingPanel, setActiveFloatingPanel] = useState(null);

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

  return (
    <div className={`portal-floating-actions ${isMenuOpen ? "is-open" : ""}`}>
      {isMenuOpen ? (
        <div className="portal-floating-actions__list">
          <div className="portal-floating-actions__item">
            <ContactUs
              isOpen={activeFloatingPanel === "contact"}
              onToggle={() => toggleFloatingPanel("contact")}
              onClose={() => closeFloatingPanel("contact")}
              skipCloseAnimation={activeFloatingPanel !== null && activeFloatingPanel !== "contact"}
            />
          </div>

          <div className="portal-floating-actions__item">
            <NotificationCenter
              isOpen={activeFloatingPanel === "notifications"}
              onToggle={() => toggleFloatingPanel("notifications")}
              onClose={() => closeFloatingPanel("notifications")}
              skipCloseAnimation={activeFloatingPanel !== null && activeFloatingPanel !== "notifications"}
            />
          </div>
        </div>
      ) : null}

      <button type="button" className="portal-floating-actions__toggle" aria-expanded={isMenuOpen} aria-label={isMenuOpen ? "Close quick actions" : "Open quick actions"} onClick={handleMenuToggle}>
        <PlusIcon />
      </button>
    </div>
  );
}