import { useEffect, useState } from "react";
import { BellIcon } from "./notificationIcons";
import "../../../styles/NotificationCenter.css";

const PANEL_TRANSITION_DURATION_MS = 220;

function getPanelTransitionDuration() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return PANEL_TRANSITION_DURATION_MS;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : PANEL_TRANSITION_DURATION_MS;
}

function renderStatusItem(message, tone = "default") {
  return (
    <li className={`portal-notifications__status portal-notifications__status--${tone}`}>
      {message}
    </li>
  );
}

export default function NotificationCenter({
  announcements = [],
  isLoading = false,
  errorMessage = "",
  isOpen,
  onToggle,
  onClose,
  skipCloseAnimation = false,
  visitedAnnouncementIds = [],
  setVisitedAnnouncementIds = () => {},
}) {
  const [isPanelMounted, setIsPanelMounted] = useState(false);
  const unreadCount = announcements.filter(
    (announcement) => !visitedAnnouncementIds.includes(announcement.id)
  ).length;
  const unreadCountLabel = unreadCount > 99 ? "99+" : unreadCount;
  const buttonLabel = isLoading
    ? "Loading announcements"
    : unreadCount > 0
      ? `${unreadCount} unread announcements`
      : "Open announcements";

  useEffect(() => {
    if (isOpen) {
      setIsPanelMounted(true);
      return undefined;
    }

    if (!isPanelMounted) {
      return undefined;
    }

    if (skipCloseAnimation) {
      setIsPanelMounted(false);
      return undefined;
    }

    const closeTimeoutId = window.setTimeout(() => {
      setIsPanelMounted(false);
    }, getPanelTransitionDuration());

    return () => {
      window.clearTimeout(closeTimeoutId);
    };
  }, [isOpen, isPanelMounted, skipCloseAnimation]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleAnnouncementClick = (event, announcementId, link) => {
    setVisitedAnnouncementIds((currentIds) => {
      if (currentIds.includes(announcementId)) {
        return currentIds;
      }

      return [...currentIds, announcementId];
    });

    if (!link || link === "#") {
      event.preventDefault();
    }
  };

  const renderAnnouncementItems = () => {
    if (isLoading) {
      return renderStatusItem("Loading announcements...");
    }

    if (errorMessage) {
      return renderStatusItem(errorMessage, "error");
    }

    if (!announcements.length) {
      return renderStatusItem("No announcements available right now.");
    }

    return announcements.map((announcement) => (
      <li key={announcement.id}>
        <a
          href={announcement.link || "#"}
          className={`portal-notifications__item ${visitedAnnouncementIds.includes(announcement.id) ? "is-visited" : ""}`}
          onClick={(event) =>
            handleAnnouncementClick(event, announcement.id, announcement.link)
          }
        >
          <span className="portal-notifications__item-marker" aria-hidden="true" />

          <div>
            <h3 className="portal-notifications__item-title">
              {announcement.title}
            </h3>
            <p className="portal-notifications__item-content">
              {announcement.content}
            </p>
          </div>
        </a>
      </li>
    ));
  };

  return (
    <div className="portal-notifications">
      {isPanelMounted ? (
        <section className={`portal-notifications__panel custom-scrollbar ${isOpen ? "is-open" : "is-closing"}`} aria-label="Announcements">
          <div className="portal-notifications__panel-head">
            <p className="portal-notifications__eyebrow">Campus updates</p>
            <h2 className="portal-notifications__title">Announcements</h2>
          </div>

          <ul className="portal-notifications__list">
            {renderAnnouncementItems()}
          </ul>
        </section>
      ) : null}

      <div className={`portal-floating-tooltip ${isOpen ? "is-open" : ""}`}>
        <button type="button" className="portal-notifications__button" aria-expanded={isOpen} aria-label={isOpen ? "Close announcements" : buttonLabel} onClick={onToggle}>
          {unreadCount > 0 ? (
            <span className="portal-notifications__badge" aria-hidden="true">
              {unreadCountLabel}
            </span>
          ) : null}
          <BellIcon />
        </button>
        <span className="portal-floating-tooltip__bubble" aria-hidden="true">
          Notification
        </span>
      </div>
    </div>
  );
}
