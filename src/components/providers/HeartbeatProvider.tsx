"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function HeartbeatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    // Initial heartbeat
    const sendHeartbeat = () => {
      fetch('/api/user/heartbeat', { method: 'POST' }).catch(() => {});
    };

    sendHeartbeat();

    // Repeated heartbeat every 2 minutes
    const interval = setInterval(sendHeartbeat, 120000);

    // Also send heartbeat when the tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);

  return <>{children}</>;
}
