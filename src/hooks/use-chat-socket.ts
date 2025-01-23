// hooks/use-chat-socket.ts

import { useCallback, useEffect, useRef } from "react";
import { useWebSocket } from "@/components/providers/websocket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { Member } from "@prisma/client";
import { WSEventType } from "@/lib/websocket";

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

  // Handle new messages
  const newMessageHandler = useCallback(
    (message: any) => {
      if (!isConnected) return;

      const formattedMessage = {
        id: message.id,
        content: message.content,
        fileUrl: message.fileUrl || null,
        fileType: message.fileType || null,
        fileName: message.fileName || null,
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
            image: message.userImage || null,
          },
        },
      };

      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData?.pages?.length) {
          return {
            pages: [{ items: [formattedMessage] }],
          };
        }

        const messageExists = oldData.pages.some((page: any) =>
          page.items.some((item: any) => item.id === formattedMessage.id)
        );

        if (messageExists) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any, index: number) => ({
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
    (message: any) => {
      if (!isConnected) return;

      const formattedMessage = {
        id: message.id,
        content: message.content,
        fileUrl: message.fileUrl || null,
        fileType: message.fileType || null,
        fileName: message.fileName || null,
        deleted: message.deleted || false,
        edited: true,
        createdAt: new Date(message.timestamp).toISOString(),
        updatedAt: new Date(message.timestamp).toISOString(),
        member: {
          id: message.memberId,
          role: message.member?.role || "GUEST",
          user: {
            id: message.userId,
            name: message.username,
            image: message.userImage || null,
          },
        },
      };

      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData?.pages?.length) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) =>
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
    (message: any) => {
      if (!isConnected) return;

      const formattedMessage = {
        id: message.id,
        content: message.content,
        fileUrl: message.fileUrl || null,
        fileType: message.fileType || null,
        fileName: message.fileName || null,
        deleted: true,
        edited: false,
        createdAt: new Date(message.timestamp).toISOString(),
        updatedAt: new Date(message.timestamp).toISOString(),
        member: {
          id: message.memberId,
          role: message.member?.role || "GUEST",
          user: {
            id: message.userId,
            name: message.username,
            image: message.userImage || null,
          },
        },
      };

      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData?.pages?.length) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) =>
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

  // const sendChatMessage = useCallback(
  //   (content: string, fileInfo?: any) => {
  //     if (!isConnected) return;

  //     sendMessage(channelKey, WSEventType.NEW_MESSAGE, {
  //       content,
  //       memberId: member.id,
  //       userId: member.userId,
  //       fileUrl: fileInfo?.url,
  //       fileType: fileInfo?.type,
  //       fileName: fileInfo?.name,
  //       timestamp: new Date().toISOString(),
  //     });
  //   },
  //   [isConnected, channelKey, member, sendMessage]
  // );

  return {
    isConnected,
    // sendMessage: sendChatMessage,
  };
};
