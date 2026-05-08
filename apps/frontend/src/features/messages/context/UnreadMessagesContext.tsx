'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getInbox } from '../lib/messages-api';
import { useAuth } from '@/features/auth/context/AuthContext';

type UnreadMessagesContextValue = {
  unreadCount: number;
  refresh: () => void;
  clearUnread: () => void;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextValue>({
  unreadCount: 0,
  refresh: () => {},
  clearUnread: () => {},
});

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.userId ?? null;
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAndSet = useCallback(() => {
    getInbox().then((res) => {
      if (res.ok) {
        setUnreadCount(res.data.reduce((sum, t) => sum + t.unreadCount, 0));
      }
    });
  }, []);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  useEffect(() => {
    if (!userId) return;

    fetchAndSet();
    const id = setInterval(fetchAndSet, 10000);
    return () => clearInterval(id);
  }, [userId, fetchAndSet]);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, refresh: fetchAndSet, clearUnread }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
