import { useEffect, useState } from "react";
import { announcements } from "../data/announcements";
import ContactUs from "./ContactUs";
import NotificationCenter from "./NotificationCenter";
import WebAccessibility from "./WebAccessibility";
import "../styles/FloatingActionMenu.css";

const MENU_TRANSITION_DURATION_MS = 220;
const VISITED_ANNOUNCEMENTS_STORAGE_KEY = "portal-visited-announcements";

function readVisitedAnnouncements() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(VISITED_ANNOUNCEMENTS_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function getMenuTransitionDuration() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return MENU_TRANSITION_DURATION_MS;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : MENU_TRANSITION_DURATION_MS;
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="portal-floating-actions__toggle-icon" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export default function FloatingActionMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [activeFloatingPanel, setActiveFloatingPanel] = useState(null);
  const [visitedAnnouncementIds, setVisitedAnnouncementIds] = useState(readVisitedAnnouncements);
  const unreadCount = announcements.filter(
    (announcement) => !visitedAnnouncementIds.includes(announcement.id)
  ).length;
  const unreadCountLabel = unreadCount > 99 ? "99+" : unreadCount;
  const toggleLabel = isMenuOpen
    ? "Close quick actions"
    : unreadCount > 0
      ? `Open quick actions. ${unreadCount} unread announcements`
      : "Open quick actions";

  useEffect(() => {
    window.localStorage.setItem(
      VISITED_ANNOUNCEMENTS_STORAGE_KEY,
      JSON.stringify(visitedAnnouncementIds)
    );
  }, [visitedAnnouncementIds]);

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

  return (
    <div className={`portal-floating-actions ${isMenuOpen ? "is-open" : ""}`}>
      {isMenuMounted ? (
        <div className={`portal-floating-actions__list ${isMenuOpen ? "is-open" : "is-closing"}`}>
          <div className="portal-floating-actions__item">
            <WebAccessibility
              isMenuOpen={isMenuOpen}
              onActivate={() => setActiveFloatingPanel(null)}
            />
          </div>

          <div className="portal-floating-actions__item">
            <NotificationCenter
              isOpen={activeFloatingPanel === "notifications"}
              onToggle={() => toggleFloatingPanel("notifications")}
              onClose={() => closeFloatingPanel("notifications")}
              skipCloseAnimation={activeFloatingPanel !== null && activeFloatingPanel !== "notifications"}
              visitedAnnouncementIds={visitedAnnouncementIds}
              setVisitedAnnouncementIds={setVisitedAnnouncementIds}
            />
          </div>

          <div className="portal-floating-actions__item">
            <ContactUs
              isOpen={activeFloatingPanel === "contact"}
              onToggle={() => toggleFloatingPanel("contact")}
              onClose={() => closeFloatingPanel("contact")}
              skipCloseAnimation={activeFloatingPanel !== null && activeFloatingPanel !== "contact"}
            />
          </div>
        </div>
      ) : null}

      <button type="button" className="portal-floating-actions__toggle" aria-expanded={isMenuOpen} aria-label={toggleLabel} onClick={handleMenuToggle}>
        {!isMenuOpen && unreadCount > 0 ? (
          <span className="portal-floating-actions__toggle-badge" aria-hidden="true">
            {unreadCountLabel}
          </span>
        ) : null}
        <PlusIcon />
      </button>
    </div>
  );
}