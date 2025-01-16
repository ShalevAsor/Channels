import PusherServer from "pusher";
import PusherClient from "pusher-js";
/**
 * Server-side Pusher instance for broadcasting events
 * This instance runs on the server and is used to publish/broadcast messages
 */
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});
/**
 * Client-side Pusher instance for subscribing to events
 * This instance runs in the browser and listens for messages
 */
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/pusher/auth",
  }
);

/**
 * Standardizes channel naming convention across the application
 * Uses presence channels (prefixed with 'presence-') to track user presence
 * @param channelId - Unique identifier for the chat channel
 * @returns Formatted channel name string
 */
export const channelName = (channelId: string) => `presence-chat-${channelId}`;

/**
 * Defines standard event types for real-time communication
 * Using 'as const' ensures type safety when using these event names
 */
export const EVENTS = {
  NEW_MESSAGE: "new-message",
  MESSAGE_UPDATE: "message-update",
  CLIENT_TYPING: "client-typing",
} as const;
