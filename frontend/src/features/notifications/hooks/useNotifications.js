import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnnouncements } from '../../../services/announcements';

const VISITED_ANNOUNCEMENTS_STORAGE_KEY = 'portal-visited-announcements';

function readVisitedAnnouncements() {
  if (typeof window === 'undefined') return [];
  try {
    const storedValue = window.localStorage.getItem(VISITED_ANNOUNCEMENTS_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function useNotifications() {
  const [visitedAnnouncementIds, setVisitedAnnouncementIds] = useState(readVisitedAnnouncements);

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const errorMessage = error ? (error.message || 'Unable to load announcements.') : '';

  const unreadCount = announcements.filter(
    (announcement) => !visitedAnnouncementIds.includes(announcement.id)
  ).length;

  useEffect(() => {
    window.localStorage.setItem(
      VISITED_ANNOUNCEMENTS_STORAGE_KEY,
      JSON.stringify(visitedAnnouncementIds)
    );
  }, [visitedAnnouncementIds]);

  const handleAnnouncementClick = (announcementId) => {
    setVisitedAnnouncementIds((currentIds) => {
      if (currentIds.includes(announcementId)) return currentIds;
      return [...currentIds, announcementId];
    });
  };

  return {
    announcements,
    isLoading,
    errorMessage,
    visitedAnnouncementIds,
    unreadCount,
    handleAnnouncementClick
  };
}
