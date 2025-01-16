"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { pusherClient } from "@/lib/pusher";

interface PusherContextType {
  isConnected: boolean;
  connectionCount: number;
  lastError: string | null;
  trackSubscription: (channelName: string) => void;
  untrackSubscription: (channelName: string) => void;
}

const PusherContext = createContext<PusherContextType>({
  isConnected: false,
  connectionCount: 0,
  lastError: null,
  trackSubscription: () => {}, // No-op function as default
  untrackSubscription: () => {}, // No-op function as default
});

export const usePusher = () => useContext(PusherContext);

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000; // 2 seconds

export const PusherProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const activeSubscriptions = useRef<Set<string>>(new Set());

  const connect = () => {
    if (pusherClient.connection.state !== "connected") {
      console.log("Initiating Pusher connection...");
      pusherClient.connect();
    }
  };

  const handleConnect = () => {
    console.log("Pusher connected:", pusherClient.connection.socket_id);
    setIsConnected(true);
    setConnectionCount((prev) => prev + 1);
    setLastError(null);
    reconnectAttempts.current = 0;
  };

  const handleDisconnect = () => {
    console.log("Pusher disconnected");
    setIsConnected(false);

    // Attempt reconnection if not exceeding max attempts
    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts.current += 1;
      console.log(
        `Attempting reconnect ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS}...`
      );

      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, RECONNECT_DELAY);
    } else {
      setLastError("Maximum reconnection attempts reached");
    }
  };

  const handleError = (error: any) => {
    console.error("Pusher error:", error);
    setIsConnected(false);
    setLastError(error.message || "Connection error occurred");
  };

  // Track subscribed channels
  const trackSubscription = (channelName: string) => {
    activeSubscriptions.current.add(channelName);
    console.log(
      `Subscribed to ${channelName}. Active subscriptions:`,
      Array.from(activeSubscriptions.current)
    );
  };

  const untrackSubscription = (channelName: string) => {
    activeSubscriptions.current.delete(channelName);
    console.log(
      `Unsubscribed from ${channelName}. Active subscriptions:`,
      Array.from(activeSubscriptions.current)
    );
  };

  useEffect(() => {
    // Initial connection
    connect();

    // Set up event handlers
    pusherClient.connection.bind("connected", handleConnect);
    pusherClient.connection.bind("disconnected", handleDisconnect);
    pusherClient.connection.bind("error", handleError);

    // Set initial state
    setIsConnected(pusherClient.connection.state === "connected");

    // Cleanup function
    return () => {
      console.log("Cleaning up Pusher connection...");

      // Clear any pending reconnection attempts
      if (reconnectTimeout.current !== null) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }

      // Unbind event handlers
      pusherClient.connection.unbind("connected", handleConnect);
      pusherClient.connection.unbind("disconnected", handleDisconnect);
      pusherClient.connection.unbind("error", handleError);

      // Unsubscribe from all channels
      activeSubscriptions.current.forEach((channel) => {
        pusherClient.unsubscribe(channel);
      });
      activeSubscriptions.current.clear();

      // Disconnect only if we're the last connection
      if (pusherClient.connection.state === "connected") {
        pusherClient.disconnect();
      }
    };
  }, []);

  // Expose subscription tracking methods through context
  const contextValue = {
    isConnected,
    connectionCount,
    lastError,
    trackSubscription,
    untrackSubscription,
  };

  return (
    <PusherContext.Provider value={contextValue}>
      {children}
    </PusherContext.Provider>
  );
};
