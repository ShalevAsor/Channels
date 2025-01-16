import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient, EVENTS } from "@/lib/pusher";
import { usePusher } from "@/components/providers/pusher-provider";
import type { Channel } from "pusher-js";
import { MessageWithMember } from "@/types";

interface ChatQueryData {
  pages: Array<{
    items: MessageWithMember[];
  }>;
}

interface ChatSocketProps {
  channelKey: string;
  queryKey: string;
}

export const useChatSocket = ({ channelKey, queryKey }: ChatSocketProps) => {
  const queryClient = useQueryClient();
  const { isConnected, trackSubscription, untrackSubscription } = usePusher();
  const channelRef = useRef<Channel | null>(null);

  const messageHandler = useCallback(
    (message: MessageWithMember) => {
      if (!isConnected) return; // Don't update cache if disconnected

      console.log("New message received:", message.id);
      queryClient.setQueryData<ChatQueryData>([queryKey], (oldData) => {
        if (!oldData?.pages?.length) {
          return {
            pages: [{ items: [message] }],
          };
        }

        const messageExists = oldData.pages.some((page) =>
          page.items.some((item) => item.id === message.id)
        );

        if (messageExists) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => ({
            ...page,
            items: index === 0 ? [message, ...page.items] : page.items,
          })),
        };
      });
    },
    [queryClient, queryKey, isConnected]
  );

  const updateMessageHandler = useCallback(
    (message: MessageWithMember) => {
      if (!isConnected) return;

      console.log("Message update received:", message.id);
      queryClient.setQueryData<ChatQueryData>([queryKey], (oldData) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === message.id ? message : item
            ),
          })),
        };
      });
    },
    [queryClient, queryKey, isConnected]
  );

  useEffect(() => {
    if (!channelKey || !isConnected) return;

    // Only subscribe if we don't already have an active subscription
    if (!channelRef.current) {
      console.log("Subscribing to channel:", channelKey);
      channelRef.current = pusherClient.subscribe(channelKey);
      trackSubscription(channelKey);

      // Bind event handlers
      channelRef.current.bind(EVENTS.NEW_MESSAGE, messageHandler);
      channelRef.current.bind(EVENTS.MESSAGE_UPDATE, updateMessageHandler);
    }

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up channel subscription:", channelKey);
        channelRef.current.unbind(EVENTS.NEW_MESSAGE, messageHandler);
        channelRef.current.unbind(EVENTS.MESSAGE_UPDATE, updateMessageHandler);
        pusherClient.unsubscribe(channelKey);
        untrackSubscription(channelKey);
        channelRef.current = null;
      }
    };
  }, [
    channelKey,
    messageHandler,
    updateMessageHandler,
    isConnected,
    trackSubscription,
    untrackSubscription,
  ]);
};
