'use client';

import { useEffect, useState } from 'react';
import EventNotificationToast from './EventNotification';
import { getTodayEvents, hasSeenNotificationToday, markNotificationAsSeen } from '@/lib/eventNotifications';

interface EconomicEvent {
  id: string;
  date: Date;
  time: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  assets: string[];
}

export default function EventNotificationManager() {
  const [notifications, setNotifications] = useState<EconomicEvent[]>([]);

  useEffect(() => {
    const checkEvents = async () => {
      const todayEvents = getTodayEvents();
      
      // Afficher événements high ET medium (pour stack)
      const unseenEvents = todayEvents.filter(event => {
        if (event.impact === 'low') return false;
        return !hasSeenNotificationToday(event.id);
      });

      if (unseenEvents.length > 0) {
        // Afficher jusqu'à 3 notifications (stack)
        const eventsToShow = unseenEvents.slice(0, 3);
        setNotifications(eventsToShow);

        // Jouer le son de notification
        playNotificationSound();
      }
    };

    checkEvents();
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => {
        console.log('Sound play blocked by browser:', err);
      });
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const handleClose = (eventId: string) => {
    markNotificationAsSeen(eventId);
    setNotifications(prev => prev.filter(n => n.id !== eventId));
  };

  return (
    <>
      {notifications.map((event, index) => (
        <div key={event.id} style={{ top: `${4 + index * 180}px` }}>
          <EventNotificationToast
            event={event}
            onClose={() => handleClose(event.id)}
            autoClose={true}
            autoCloseDelay={10000}
          />
        </div>
      ))}
    </>
  );
}