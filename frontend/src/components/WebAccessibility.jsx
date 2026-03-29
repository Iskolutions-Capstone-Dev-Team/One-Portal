import { useEffect, useState } from "react";
import { usePortalTheme } from "../context/PortalThemeContext";
import "../styles/WebAccessibility.css";

const SIENNA_SCRIPT_ID = "portal-accessibility-script";
const SIENNA_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/sienna-accessibility@latest/dist/sienna-accessibility.umd.js";
const SIENNA_TRIGGER_SELECTOR = ".asw-menu-btn";
const SIENNA_CLOSE_SELECTOR = ".asw-menu-close";
const SIENNA_OVERLAY_SELECTOR = ".asw-overlay";

function applyPortalTheme(theme) {
  document.documentElement.setAttribute("data-portal-theme", theme);
}

function createSiennaScript() {
  const script = document.createElement("script");

  script.id = SIENNA_SCRIPT_ID;
  script.src = SIENNA_SCRIPT_SRC;
  script.defer = true;
  script.setAttribute("data-asw-position", "bottom-right");

  return script;
}

function getSiennaTriggerButton() {
  return document.querySelector(SIENNA_TRIGGER_SELECTOR);
}

function loadSiennaScript(onReady) {
  const triggerButton = getSiennaTriggerButton();

  if (triggerButton) {
    onReady?.();
    return;
  }

  const existingScript = document.getElementById(SIENNA_SCRIPT_ID);

  if (existingScript) {
    if (existingScript.dataset.loaded === "true") {
      onReady?.();
      return;
    }

    existingScript.addEventListener("load", () => onReady?.(), { once: true });
    return;
  }

  const script = createSiennaScript();
  script.addEventListener("load", () => {
    script.dataset.loaded = "true";
    onReady?.();
  }, { once: true });

  document.body.appendChild(script);
}

function openAccessibilityMenu() {
  const triggerButton = getSiennaTriggerButton();

  if (triggerButton) {
    triggerButton.click();
    return;
  }

  loadSiennaScript(() => {
    getSiennaTriggerButton()?.click();
  });
}

function closeAccessibilityMenu() {
  const closeButton = document.querySelector(SIENNA_CLOSE_SELECTOR);

  if (closeButton) {
    closeButton.click();
    return;
  }

  const overlay = document.querySelector(SIENNA_OVERLAY_SELECTOR);

  if (overlay) {
    overlay.click();
  }
}

function AccessibilityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="portal-accessibility__button-icon" aria-hidden="true">
      <path d="M12 2.25a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
      <path d="M6.77 7.75a.75.75 0 0 0 0 1.5h3.98v11a.75.75 0 0 0 1.5 0v-5h.5v5a.75.75 0 0 0 1.5 0v-11h3.98a.75.75 0 0 0 0-1.5H6.77Z" />
    </svg>
  );
}

export default function WebAccessibility({
  isMenuOpen = false,
  isButtonVisible = false,
  onActivate = () => {},
}) {
  const { theme } = usePortalTheme();
  const [isAccessibilityMenuOpen, setIsAccessibilityMenuOpen] = useState(false);

  useEffect(() => {
    applyPortalTheme(theme);
  }, [theme]);

  useEffect(() => {
    loadSiennaScript();
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (
        event.target.closest(SIENNA_CLOSE_SELECTOR) ||
        event.target.closest(SIENNA_OVERLAY_SELECTOR)
      ) {
        setIsAccessibilityMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsAccessibilityMenuOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen && isAccessibilityMenuOpen) {
      closeAccessibilityMenu();
      setIsAccessibilityMenuOpen(false);
    }
  }, [isMenuOpen, isAccessibilityMenuOpen]);

  const handleButtonClick = () => {
    onActivate();
    setIsAccessibilityMenuOpen(true);
    openAccessibilityMenu();
  };

  if (!isButtonVisible) {
    return null;
  }

  return (
    <div className={`portal-accessibility ${isMenuOpen ? "is-open" : "is-closing"}`}>
      <div className="portal-floating-tooltip">
        <button
          type="button"
          className="portal-accessibility__button"
          aria-label="Open accessibility menu"
          aria-haspopup="dialog"
          onClick={handleButtonClick}
        >
          <AccessibilityIcon />
        </button>
        <span className="portal-floating-tooltip__bubble" aria-hidden="true">
          Accessibility
        </span>
      </div>
    </div>
  );
}