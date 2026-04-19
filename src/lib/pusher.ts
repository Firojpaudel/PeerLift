import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher (for triggering events)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher (Singleton to prevent connection leaks)
declare global {
  var pusherClient: PusherClient | undefined;
}

export const getPusherClient = () => {
  if (typeof window === 'undefined') return null;
  
  if (!globalThis.pusherClient) {
    globalThis.pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
    });
  }
  
  return globalThis.pusherClient;
};
