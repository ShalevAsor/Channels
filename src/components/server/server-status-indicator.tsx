import { cn } from "@/lib/utils";
import { useWebSocket } from "../providers/websocket-provider";

interface StatusIndicatorProps {
  isConnected: boolean;
  className?: string;
}

export const StatusIndicator = ({
  isConnected,
  className,
}: StatusIndicatorProps) => {
  return (
    <div
      className={cn(
        "w-2.5 h-2.5 rounded-full",
        isConnected ? "bg-emerald-500" : "bg-zinc-500",
        className
      )}
    />
  );
};
