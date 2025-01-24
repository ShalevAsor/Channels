// hooks/use-chat-socket.ts

import { useCallback, useEffect, useRef } from "react";
import { useWebSocket } from "@/components/providers/websocket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { Member } from "@prisma/client";
import { BaseMessagePayload, WSEventType } from "@/lib/websocket";

interface QueryData {
  pages: Array<{
    items: Array<FormattedMessage>;
  }>;
}

interface FormattedMessage {
  id: string;
  content: string;
  fileUrl: string | null;
  fileType: string | null;
  fileName: string | null;
  deleted: boolean;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}

/**
 * Props for configuring the chat socket behavior
 */
interface ChatSocketProps {
  channelKey: string; // Unique identifier for the chat channel
  queryKey: string; // Key for React Query cache
  member: Member; // Current user's member information
}
export const useChatSocket = ({
  channelKey,
  queryKey,
  member,
}: ChatSocketProps) => {
  const queryClient = useQueryClient();
  const hasSubscribed = useRef(false);
  const {
    isConnected,
    subscribe,
    unsubscribe,
    // sendMessage,
    addMessageHandler,
    removeMessageHandler,
  } = useWebSocket();
  const formatMessage = (message: BaseMessagePayload): FormattedMessage => ({
    id: message.id,
    content: message.content,
    fileUrl: message.fileUrl,
    fileType: message.fileType,
    fileName: message.fileName,
    deleted: false,
    edited: false,
    createdAt: new Date(message.timestamp).toISOString(),
    updatedAt: new Date(message.timestamp).toISOString(),
    member: {
      id: message.memberId,
      role: message.member?.role || "GUEST",
      user: {
        id: message.userId,
        name: message.username,
        image: message.userImage,
      },
    },
  });
  // Handle new messages
  const newMessageHandler = useCallback(
    (message: BaseMessagePayload) => {
      if (!isConnected) return;

      const formattedMessage = formatMessage(message);

      queryClient.setQueryData<QueryData>([queryKey], (oldData) => {
        if (!oldData?.pages?.length) {
          return {
            pages: [{ items: [formattedMessage] }],
          };
        }

        const messageExists = oldData.pages.some((page) =>
          page.items.some((item: any) => item.id === formattedMessage.id)
        );

        if (messageExists) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => ({
            ...page,
            items: index === 0 ? [formattedMessage, ...page.items] : page.items,
          })),
        };
      });
    },
    [queryClient, queryKey, isConnected, member.role]
  );

  // Handle message updates
  const messageUpdateHandler = useCallback(
    (message: BaseMessagePayload) => {
      if (!isConnected) return;

      const formattedMessage = formatMessage(message);

      queryClient.setQueryData<QueryData>([queryKey], (oldData) => {
        if (!oldData?.pages?.length) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === formattedMessage.id ? formattedMessage : item
            ),
          })),
        };
      });
    },
    [queryClient, queryKey, isConnected, member.role]
  );
  // Add message delete handler
  const messageDeleteHandler = useCallback(
    (message: BaseMessagePayload) => {
      if (!isConnected) return;

      const formattedMessage = formatMessage(message);

      queryClient.setQueryData<QueryData>([queryKey], (oldData) => {
        if (!oldData?.pages?.length) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === formattedMessage.id ? formattedMessage : item
            ),
          })),
        };
      });
    },
    [queryClient, queryKey, isConnected, member.role]
  );
  // Subscribe only once when connected and channelKey is available
  useEffect(() => {
    if (!isConnected || !channelKey || hasSubscribed.current) return;

    console.log(`Subscribing to channel: ${channelKey}`);

    subscribe(channelKey, member.userId, {
      memberId: member.id,
      role: member.role,
    });

    addMessageHandler(WSEventType.NEW_MESSAGE, newMessageHandler);
    addMessageHandler(WSEventType.MESSAGE_UPDATE, messageUpdateHandler);
    addMessageHandler(WSEventType.MESSAGE_DELETE, messageDeleteHandler);

    hasSubscribed.current = true;

    return () => {
      console.log(`Cleaning up subscription for channel: ${channelKey}`);
      removeMessageHandler(WSEventType.NEW_MESSAGE, newMessageHandler);
      removeMessageHandler(WSEventType.MESSAGE_UPDATE, messageUpdateHandler);
      removeMessageHandler(WSEventType.MESSAGE_DELETE, messageDeleteHandler);

      unsubscribe(channelKey);
      hasSubscribed.current = false;
    };
  }, [
    isConnected,
    channelKey,
    member.userId,
    member.id,
    member.role,
    subscribe,
    unsubscribe,
    addMessageHandler,
    removeMessageHandler,
    newMessageHandler,
    messageUpdateHandler,
    messageDeleteHandler,
  ]);

  return {
    isConnected,
  };
};
