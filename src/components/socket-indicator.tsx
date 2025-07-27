"use client";

import { useWebSocket } from "@/components/providers/websocket-provider";
import { Badge } from "@/components/ui/badge";

export const SocketIndicator = () => {
  // Use our WebSocket hook instead of Pusher
  const { isConnected, lastError } = useWebSocket();

  // Show an error state if there's a connection error
  if (lastError) {
    return (
      <Badge variant="outline" className="bg-red-600 text-white border-none">
        Connection Error: {lastError}
      </Badge>
    );
  }

  // Show polling state when disconnected
  if (!isConnected) {
    return (
      <Badge variant="outline" className="bg-yellow-600 text-white border-none">
        Fallback: Polling every 1s
      </Badge>
    );
  }

  // Show connected state
  return (
    <Badge variant="outline" className="bg-emerald-600 text-white border-none">
      Live: Real-time updates
    </Badge>
  );
};
