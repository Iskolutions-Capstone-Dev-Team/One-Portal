import { useEffect, useState } from 'react';
import { BellIcon, CircleCheckIcon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

function renderStatusItem(message, tone = 'default') {
  return (
    <div className={`px-4 py-8 mx-3 my-2 rounded-xl text-[0.9rem] font-medium text-center bg-slate-50 dark:bg-[#141414] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/10 ${tone === 'error' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50' : ''}`}>
      {message}
    </div>
  );
}

export default function NotificationCenter() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [visitedAnnouncementIds, setVisitedAnnouncementIds] = useState(readVisitedAnnouncements);

  const unreadCount = announcements.filter(
    (announcement) => !visitedAnnouncementIds.includes(announcement.id)
  ).length;

  useEffect(() => {
    let isMounted = true;
    const loadAnnouncements = async () => {
      setIsLoading(true);
      try {
        const announcementItems = await getAnnouncements();
        if (!isMounted) return;
        setAnnouncements(announcementItems);
        setErrorMessage('');
      } catch (error) {
        if (!isMounted) return;
        setAnnouncements([]);
        setErrorMessage(error.message || 'Unable to load announcements.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void loadAnnouncements();
    return () => { isMounted = false; };
  }, []);

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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size='icon' variant='outline' className='relative w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white focus:text-white dark:bg-[#f8d24e]/10 dark:hover:bg-[#f8d24e]/20 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:text-[#ffe28a] dark:focus:text-[#ffe28a] data-[state=open]:text-white dark:data-[state=open]:text-[#ffe28a] transition-colors data-[state=open]:bg-white/20 dark:data-[state=open]:bg-[#f8d24e]/20 data-[state=open]:ring-2 data-[state=open]:ring-white/50 dark:data-[state=open]:ring-[#f8d24e]/50 data-[state=open]:ring-offset-0' aria-label={`Notifications (${unreadCount})`}>
          <BellIcon className='w-5 h-5 !text-white dark:!text-[#ffe28a]' aria-hidden='true' />
          {unreadCount > 0 && (
            <Badge
              className='absolute -top-1 -right-1 rounded-full px-1 min-w-[1.2rem] h-[1.2rem] text-[0.65rem] font-bold bg-yellow-400 text-[#991b1b] hover:bg-yellow-500 border-none flex items-center justify-center shadow-sm'
              aria-hidden='true'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" showCloseButton={false} className='w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] border-none shadow-xl'>
        <SheetHeader className="px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] flex flex-row justify-between items-start text-left">
          <div className="flex flex-col">
            <SheetTitle className="text-lg font-bold text-white">Campus updates</SheetTitle>
            <SheetDescription className="text-sm text-white/80">
              Announcements
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <button className="rounded-full p-1.5 mt-1 -mr-2 hover:bg-white/10 text-white/70 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/50">
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </SheetClose>
        </SheetHeader>
        <div className='flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50 dark:bg-transparent'>
          {isLoading ? (
            renderStatusItem('Loading announcements...')
          ) : errorMessage ? (
            renderStatusItem(errorMessage, 'error')
          ) : !announcements.length ? (
            renderStatusItem('No announcements available right now.')
          ) : (
            <Accordion type="single" collapsible className="space-y-2 border-0 w-full pb-8">
              {announcements.map((announcement) => (
                <AccordionItem key={announcement.id} value={String(announcement.id)} className={`border-slate-200 dark:border-white/10 rounded-lg border px-3 transition-colors ${visitedAnnouncementIds.includes(announcement.id) ? 'bg-slate-50 dark:bg-transparent' : 'bg-white dark:bg-[#141414] shadow-sm'}`}>
                  <AccordionTrigger onClick={() => handleAnnouncementClick(announcement.id)} className="items-center py-4 font-medium hover:no-underline text-left">
                    <div className="flex w-full items-start justify-between pr-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {!visitedAnnouncementIds.includes(announcement.id) ? (
                          <div className="flex size-5 mt-0.5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                            <div className="size-2 rounded-full bg-[#991b1b]" />
                          </div>
                        ) : (
                          <div className="flex size-5 mt-0.5 shrink-0 items-center justify-center">
                            <CircleCheckIcon className="fill-green-500 text-white dark:text-slate-900 size-5" />
                          </div>
                        )}
                        <span className={`text-[0.95rem] text-slate-900 dark:text-slate-100 break-words flex-1 min-w-0 ${visitedAnnouncementIds.includes(announcement.id) ? 'font-medium' : 'font-bold'}`}>
                          {announcement.title}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-400 pt-0 pb-4 pl-8 text-[0.85rem] leading-relaxed break-words text-justify">
                    {announcement.content}
                    {announcement.link && announcement.link !== '#' && (
                      <div className="mt-3">
                        <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="text-[#7b0d15] dark:text-red-400 hover:underline font-medium">Read more &rarr;</a>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
