import { useEffect, useState } from "react";
import { getAnnouncements } from "../services/announcements";
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
  const [announcements, setAnnouncements] = useState([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [announcementError, setAnnouncementError] = useState("");
  const [visitedAnnouncementIds, setVisitedAnnouncementIds] = useState(readVisitedAnnouncements);
  const unreadCount = announcements.filter(
    (announcement) => !visitedAnnouncementIds.includes(announcement.id)
  ).length;
  const unreadCountLabel = unreadCount > 99 ? "99+" : unreadCount;
  const toggleLabel = isMenuOpen
    ? "Close quick actions"
    : isLoadingAnnouncements
      ? "Open quick actions. Loading announcements"
    : unreadCount > 0
      ? `Open quick actions. ${unreadCount} unread announcements`
      : "Open quick actions";

  useEffect(() => {
    let isMounted = true;

    const loadAnnouncements = async () => {
      setIsLoadingAnnouncements(true);

      try {
        const announcementItems = await getAnnouncements();

        if (!isMounted) {
          return;
        }

        setAnnouncements(announcementItems);
        setAnnouncementError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAnnouncements([]);
        setAnnouncementError(error.message || "Unable to load announcements.");
      } finally {
        if (isMounted) {
          setIsLoadingAnnouncements(false);
        }
      }
    };

    void loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleContactClick = () => {
    setActiveFloatingPanel(null);
    setIsMenuOpen(false);
  };

  return (
    <div className={`portal-floating-actions ${isMenuOpen ? "is-open" : ""}`}>
      <WebAccessibility
        isMenuOpen={isMenuOpen}
        isButtonVisible={isMenuMounted}
        onActivate={() => setActiveFloatingPanel(null)}
      />

      {isMenuMounted ? (
        <div className={`portal-floating-actions__list ${isMenuOpen ? "is-open" : "is-closing"}`}>
          <div className="portal-floating-actions__item">
            <NotificationCenter
              announcements={announcements}
              isLoading={isLoadingAnnouncements}
              errorMessage={announcementError}
              isOpen={activeFloatingPanel === "notifications"}
              onToggle={() => toggleFloatingPanel("notifications")}
              onClose={() => closeFloatingPanel("notifications")}
              skipCloseAnimation={activeFloatingPanel !== null && activeFloatingPanel !== "notifications"}
              visitedAnnouncementIds={visitedAnnouncementIds}
              setVisitedAnnouncementIds={setVisitedAnnouncementIds}
            />
          </div>

          <div className="portal-floating-actions__item">
            <ContactUs onClick={handleContactClick} />
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
