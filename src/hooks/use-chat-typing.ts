// hooks/use-chat-typing.ts
import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "@/components/providers/websocket-provider";
import { WSEventType } from "@/lib/websocket";

interface TypingUser {
  userId: string;
  username: string;
}
interface TypingStartEvent {
  userId: string;
  username: string;
  typingUsers?: TypingUser[];
}

interface TypingStopEvent {
  userId: string;
  remainingTypingUsers?: TypingUser[];
}
export const useChatTyping = (channelId: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { addMessageHandler, removeMessageHandler } = useWebSocket();

  // Handle when someone starts typing
  const handleTypingStart = useCallback((data: TypingStartEvent) => {
    console.log("Received typing start event:", data);

    // Now expecting an array of typing users from the server
    if (data.typingUsers) {
      setTypingUsers(data.typingUsers);
      console.log("Updated typing users:", data.typingUsers);
    } else {
      // Fallback for single user data format
      setTypingUsers((prev) => {
        const exists = prev.some((user) => user.userId === data.userId);
        if (exists) {
          console.log("User already in typing list:", data.userId);
          return prev;
        }
        const newUsers = [
          ...prev,
          { userId: data.userId, username: data.username },
        ];
        console.log("Added new typing user:", newUsers);
        return newUsers;
      });
    }
  }, []);

  // Handle when someone stops typing
  const handleTypingStop = useCallback((data: TypingStopEvent) => {
    console.log("Received typing stop event:", data);

    // If we receive an updated list of typing users
    if (data.remainingTypingUsers) {
      setTypingUsers(data.remainingTypingUsers);
      console.log(
        "Updated typing users after stop:",
        data.remainingTypingUsers
      );
    } else {
      // Fallback for single user removal
      setTypingUsers((prev) => {
        const newUsers = prev.filter((user) => user.userId !== data.userId);
        console.log("Removed typing user, remaining:", newUsers);
        return newUsers;
      });
    }
  }, []);

  useEffect(() => {
    console.log("Setting up typing handlers for channel:", channelId);

    addMessageHandler(WSEventType.MEMBER_TYPING, handleTypingStart);
    addMessageHandler(WSEventType.MEMBER_STOP_TYPING, handleTypingStop);

    return () => {
      console.log("Cleaning up typing handlers for channel:", channelId);
      removeMessageHandler(WSEventType.MEMBER_TYPING, handleTypingStart);
      removeMessageHandler(WSEventType.MEMBER_STOP_TYPING, handleTypingStop);
    };
  }, [
    addMessageHandler,
    removeMessageHandler,
    handleTypingStart,
    handleTypingStop,
    channelId,
  ]);

  useEffect(() => {
    console.log("Current typing users:", typingUsers);
  }, [typingUsers]);

  return { typingUsers };
};
