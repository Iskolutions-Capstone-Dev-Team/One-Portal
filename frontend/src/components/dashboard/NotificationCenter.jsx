import { useEffect, useState } from "react";
import { announcements } from "../../data/announcements";
import "./NotificationCenter.css";

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

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="portal-notifications__button-icon" aria-hidden="true">
      <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd"/>
    </svg>
  );
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [visitedAnnouncementIds, setVisitedAnnouncementIds] = useState(readVisitedAnnouncements);

  useEffect(() => {
    window.localStorage.setItem(
      VISITED_ANNOUNCEMENTS_STORAGE_KEY,
      JSON.stringify(visitedAnnouncementIds)
    );
  }, [visitedAnnouncementIds]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

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

  return (
    <div className="portal-notifications">
      {isOpen ? (
        <section className="portal-notifications__panel custom-scrollbar" aria-label="Announcements">
          <div className="portal-notifications__panel-head">
            <p className="portal-notifications__eyebrow">Campus updates</p>
            <h2 className="portal-notifications__title">Announcements</h2>
          </div>

          <ul className="portal-notifications__list">
            {announcements.map((announcement) => (
              <li key={announcement.id}>
                <a href={announcement.link} className={`portal-notifications__item ${visitedAnnouncementIds.includes(announcement.id) ? "is-visited" : ""}`}
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
            ))}
          </ul>
        </section>
      ) : null}

      <button type="button" className="portal-notifications__button" aria-expanded={isOpen} aria-label={isOpen ? "Close announcements" : "Open announcements"} onClick={() => setIsOpen((currentValue) => !currentValue)}>
        <BellIcon />
      </button>
    </div>
  );
}