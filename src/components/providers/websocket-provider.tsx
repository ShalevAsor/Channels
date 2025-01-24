/**
 * WebSocket Provider Component
 *
 * A React Context provider that manages real-time WebSocket connections.
 * This provider handles all aspects of WebSocket communication including:
 * - Connection establishment and authentication
 * - Automatic reconnection with exponential backoff
 * - Channel subscription management
 * - Message handling and distribution
 *
 * Key Features:
 * - Robust error handling and automatic reconnection
 * - Authentication token management
 * - Channel-based subscription system
 * - Type-safe message handling
 * - Connection state management
 *
 * Technical Implementation:
 * - Uses React Context for app-wide WebSocket state management
 * - Implements exponential backoff for reconnection attempts
 * - Maintains connection health through server health checks
 * - Preserves subscriptions across reconnections
 */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { WSEventType, BaseMessagePayload } from "@/lib/websocket";
import { UserInfo } from "@/types";

/**
 * MessageHandler Type
 * Defines the structure for WebSocket message handlers
 * Ensures type safety for message processing throughout the application
 */
type MessageHandler = (message: BaseMessagePayload) => void;
// Define type for WebSocket message data

type MessageHandlersMap = Map<string, Set<MessageHandler>>;

/**
 * WebSocketContextType Interface
 * Defines the shape of the WebSocket context that will be available throughout the application
 *
 * @property isConnected - Indicates if WebSocket connection is currently active
 * @property connectionCount - Tracks number of successful connections (useful for debugging)
 * @property lastError - Stores most recent connection error message
 * @property subscribe - Function to subscribe to a specific channel
 * @property unsubscribe - Function to unsubscribe from a channel
 * @property addMessageHandler - Registers a new message handler for specific events
 * @property removeMessageHandler - Removes a previously registered message handler
 */
interface WebSocketContextType {
  isConnected: boolean;
  connectionCount: number;
  lastError: string | null;
  subscribe: (channelName: string, userId: string, userInfo: UserInfo) => void;
  unsubscribe: (channelName: string) => void;

  addMessageHandler: (event: WSEventType, handler: MessageHandler) => void;
  removeMessageHandler: (event: WSEventType, handler: MessageHandler) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  connectionCount: 0,
  lastError: null,
  subscribe: () => {},
  unsubscribe: () => {},
  addMessageHandler: () => {},
  removeMessageHandler: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);
/** Base WebSocket server URL with fallback to localhost for development */

const WS_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_HTTP_URL || "ws://localhost:3001";
/**
 * Reconnection Strategy Constants
 * Implements an exponential backoff strategy to prevent overwhelming the server
 */
const INITIAL_RECONNECT_DELAY = 2000; // 2 seconds
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const BACKOFF_MULTIPLIER = 1.5; // Each attempt waits 1.5 times longer

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /* Track connection state and error details */
  const [isConnected, setIsConnected] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  /**
   * WebSocket Reference Management System
   *
   * Uses React's useRef hooks to maintain stable references across re-renders while managing
   * the complex state of the WebSocket connection. This system is crucial for maintaining
   * connection stability and handling reconnection logic.
   */
  /*  Holds the active WebSocket connection reference */
  const wsRef = useRef<WebSocket | null>(null);
  /*  Tracks number of reconnection attempts */
  const reconnectAttempts = useRef(0);
  /* Manages reconnection timing */
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  /* Subscription and Message Handling */
  const activeSubscriptions = useRef<Set<string>>(new Set());
  const messageHandlers = useRef<MessageHandlersMap>(new Map());
  // Stores message handlers for different event types
  /* Reconnection State Management */
  const currentReconnectDelay = useRef(INITIAL_RECONNECT_DELAY);
  const isInPollingMode = useRef(false);
  /* Function References for Stability */
  const scheduleReconnectRef = useRef<(() => void) | null>(null);
  const connectRef = useRef<(() => Promise<void>) | null>(null);
  /**
   * Message Handler Management System
   * Implements a pub/sub pattern for WebSocket messages
   *
   * Allows components to:
   * - Subscribe to specific message types
   * - Process messages in a type-safe way
   * - Clean up subscriptions when unmounting
   */
  const addMessageHandler = useCallback(
    (event: string, handler: MessageHandler) => {
      if (!messageHandlers.current.has(event)) {
        messageHandlers.current.set(event, new Set());
      }
      messageHandlers.current.get(event)!.add(handler);
      console.log(`Added message handler for event: ${event}`);
    },
    []
  );

  const removeMessageHandler = useCallback(
    (event: string, handler: MessageHandler) => {
      const handlers = messageHandlers.current.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          messageHandlers.current.delete(event);
        }
        console.log(`Removed message handler for event: ${event}`);
      }
    },
    []
  );

  /**
   * WebSocket Reconnection Strategy
   *
   * Implements an intelligent reconnection system with exponential backoff to handle
   * network interruptions gracefully while preventing server overload.
   */
  scheduleReconnectRef.current = useCallback(() => {
    // Clear any existing reconnection attempts
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    console.log(
      `Scheduling reconnection attempt in ${currentReconnectDelay.current}ms`
    );
    // Schedule the next reconnection attempt
    reconnectTimeout.current = setTimeout(() => {
      // Implement exponential backoff by increasing delay time
      currentReconnectDelay.current = Math.min(
        currentReconnectDelay.current * BACKOFF_MULTIPLIER,
        MAX_RECONNECT_DELAY
      );
      connectRef.current?.();
    }, currentReconnectDelay.current);
  }, []);
  /**
   * WebSocket Connection Establishment
   *
   * Manages the complete lifecycle of establishing and maintaining a WebSocket connection.
   * This system includes:
   * 1. Server health verification
   * 2. Authentication
   * 3. Connection establishment
   * 4. State restoration
   */
  connectRef.current = useCallback(async () => {
    // Only attempt to connect if we don't have an active connection
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      try {
        /**
         * Step 1: Server Health Check
         * Verifies server availability before attempting WebSocket connection
         * This prevents unnecessary connection attempts to an unavailable server
         */
        try {
          const serverUrl = WS_URL.replace("ws:", "http:");
          await fetch(`${serverUrl}/health`, {
            method: "HEAD",
            signal: AbortSignal.timeout(2000), // Ensure quick failure for unavailable servers
          });
        } catch (error) {
          // Server health check failed - implement backoff strategy

          console.error(
            `Server unavailable - retrying in ${currentReconnectDelay.current}ms`,
            error
          );
          isInPollingMode.current = true;
          scheduleReconnectRef.current?.();
          return;
        }
        /**
         * Step 2: Authentication
         * Obtains a secure token for WebSocket connection authentication
         * This ensures only authorized clients can establish connections
         */

        console.log("Server available, initiating authentication...");

        // Attempt to get authentication token
        const response = await fetch("/api/ws/auth");
        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.statusText}`);
        }

        const { token } = await response.json();
        console.log(
          "Authentication successful, establishing WebSocket connection..."
        );
        /**
         * Step 3: WebSocket Connection Establishment
         * Creates the WebSocket connection with authentication token
         * Sets up all necessary event handlers for the connection
         */

        // Create new WebSocket connection with auth token
        wsRef.current = new WebSocket(`${WS_URL}?token=${token}`);

        /**
         * Connection Success Handler
         * Manages successful connection establishment and state restoration
         */
        wsRef.current.onopen = () => {
          console.log("WebSocket connection established successfully");
          setIsConnected(true);
          setConnectionCount((prev) => prev + 1);
          setLastError(null);

          // Reset reconnection parameters on successful connection
          reconnectAttempts.current = 0;
          currentReconnectDelay.current = INITIAL_RECONNECT_DELAY;
          isInPollingMode.current = false;

          /**
           * State Restoration
           * Resubscribes to all previously active channels
           * Ensures continuous service after reconnection
           */
          activeSubscriptions.current.forEach((channelName) => {
            console.log(`Restoring subscription to channel: ${channelName}`);
            wsRef.current?.send(
              JSON.stringify({
                type: "subscribe",
                channelName,
              })
            );
          });
        };

        /**
         * Connection Closure Handler
         * Implements sophisticated error handling and recovery strategies
         * based on different types of connection closures
         */
        wsRef.current.onclose = (event) => {
          setIsConnected(false);

          switch (event.code) {
            case 1000: // Normal closure
              console.log(
                "WebSocket closed normally - will attempt to reconnect"
              );
              scheduleReconnectRef.current?.();
              break;

            case 1008: // Authentication failure
              console.log("Authentication expired - please refresh the page");
              setLastError("Session expired - please refresh the page");
              // Don't attempt reconnection for auth failures
              break;

            case 1006: // Abnormal closure (server down)
              console.log(
                `Lost connection to server - retrying in ${currentReconnectDelay.current}ms`
              );
              scheduleReconnectRef.current?.();
              break;

            default:
              console.log(
                `WebSocket closed with code ${event.code} - scheduling reconnection`
              );
              scheduleReconnectRef.current?.();
          }
        };

        /**
         * Message Handler
         * Processes incoming messages and distributes them to appropriate handlers
         * Implements error handling for malformed messages
         */
        wsRef.current.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            const messageType = data.event as WSEventType;
            const messageData = data.data as BaseMessagePayload;

            console.debug("Received message:", { type: messageType });
            // Distribute message to registered handlers
            const handlers = messageHandlers.current.get(messageType);
            if (handlers) {
              handlers.forEach((handler) => handler(messageData));
            } else {
              console.debug(
                `No handlers registered for message type: ${messageType}`
              );
            }
          } catch (error) {
            console.warn("Failed to process incoming message:", error);
          }
        };

        /**
         * Error Handler
         * Manages WebSocket errors and triggers reconnection process
         * Note: onclose will be called after onerror
         */
        wsRef.current.onerror = () => {
          console.log(
            `Connection issues detected - will retry in ${currentReconnectDelay.current}ms`
          );
          setIsConnected(false);
          // Don't schedule reconnect here as onclose will be called after onerror
        };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Authentication failed")
        ) {
          console.error("Authentication failed:", error);
          setLastError("Authentication failed - please refresh the page");
          // Don't attempt reconnection for authentication failures
        } else {
          console.log(
            `Unable to establish connection - retrying in ${currentReconnectDelay.current}ms`
          );
          setIsConnected(false);
          scheduleReconnectRef.current?.();
        }
      }
    }
  }, []);

  /**
   * Channel Subscription Management
   *
   * Implements a robust system for managing channel subscriptions within the WebSocket connection.
   * This system ensures that components can subscribe to specific channels and receive real-time
   * updates while maintaining a clean subscription state.
   */
  const subscribe = useCallback(
    (channelName: string, userId: string, userInfo: UserInfo) => {
      // Only attempt subscription if WebSocket connection is active
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        /**
         * Duplicate Subscription Prevention
         * Checks if channel is already subscribed to avoid unnecessary server requests
         * and potential message duplication
         */
        if (activeSubscriptions.current.has(channelName)) {
          console.log(`Already subscribed to ${channelName}, skipping`);
          return;
        }
        /**
         * Subscription Message Structure
         * Sends a formatted subscription request to the server containing:
         * - Channel identification
         * - User identification
         * - Additional user information for presence features
         */
        wsRef.current.send(
          JSON.stringify({
            type: "subscribe",
            channelName,
            userId,
            userInfo,
          })
        );
        // Track active subscription for reconnection handling
        activeSubscriptions.current.add(channelName);
        console.log(`Subscribed to ${channelName}`);
      }
    },
    []
  );
  /**
   * Channel Unsubscription Handler
   *
   * Manages the cleanup of channel subscriptions when components no longer need
   * real-time updates. This helps maintain efficient resource usage and prevents
   * memory leaks.
   */
  const unsubscribe = useCallback((channelName: string) => {
    // Remove channel from active subscriptions tracking
    activeSubscriptions.current.delete(channelName);
    console.log(`Unsubscribed from ${channelName}`);
  }, []);
  /**
   * WebSocket Provider Lifecycle Management
   *
   * Controls the initialization and cleanup of the WebSocket connection and its associated
   * resources. This effect ensures proper setup and teardown of all WebSocket-related
   * functionality.
   */
  useEffect(() => {
    const subscriptions = activeSubscriptions.current;
    const handlers = messageHandlers.current;
    const timeout = reconnectTimeout.current;
    const ws = wsRef.current;

    connectRef.current?.();

    return () => {
      console.log("Cleaning up WebSocket connection...");

      if (timeout) {
        clearTimeout(timeout);
      }

      if (ws) {
        ws.close();
        wsRef.current = null;
      }

      subscriptions.clear();
      handlers.clear();
    };
  }, []);

  const contextValue = {
    isConnected,
    connectionCount,
    lastError,
    subscribe,
    unsubscribe,
    addMessageHandler,
    removeMessageHandler,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
