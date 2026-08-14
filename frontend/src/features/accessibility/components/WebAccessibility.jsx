import { useEffect, useState } from "react";
import { usePortalTheme } from "../../../providers/PortalThemeProvider";
import { AccessibilityIcon } from "./accessibilityIcons";
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

export default function WebAccessibility() {
  const { theme } = usePortalTheme();
  const [isAccessibilityMenuOpen, setIsAccessibilityMenuOpen] = useState(false);

  useEffect(() => {
    applyPortalTheme(theme);
  }, [theme]);

  useEffect(() => {
    loadSiennaScript();
  }, []);

  return null;
}
