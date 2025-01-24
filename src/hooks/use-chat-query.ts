// hooks/use-chat-query.ts

import { useInfiniteQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/components/providers/websocket-provider";
import { getMessages } from "@/actions/message";
import { getDirectMessages } from "@/actions/direct-messages";
import { ActionResponse } from "@/lib/errors/handle-error";
import { PaginatedDirectMessages, PaginatedMessages } from "@/types";

/**
 * Default page size for message queries
 */
const DEFAULT_PAGE_SIZE = 10;

/**
 * Props for configuring the chat query behavior
 */
interface ChatQueryProps {
  queryKey: string; // Unique identifier for the query cache
  paramKey: "channelId" | "conversationId"; // Type of ID we're querying with
  paramValue: string; // The actual ID value
  type: "channel" | "conversation"; // The type of chat we're querying
  pageSize?: number; // Optional custom page size
}

/**
 * Custom hook that manages fetching and pagination of chat messages
 * Integrates with WebSocket for real-time updates and React Query for caching
 */
export const useChatQuery = ({
  queryKey,
  paramValue,
  type,
}: ChatQueryProps) => {
  // Get WebSocket connection status for managing polling fallback
  const { isConnected } = useWebSocket();

  /**
   * Main query configuration using React Query's useInfiniteQuery
   */
  return useInfiniteQuery({
    queryKey: [queryKey],

    /**
     * Fetch function that handles both channel and direct messages
     */
    queryFn: async ({ pageParam }) => {
      try {
        // Execute appropriate query based on chat type
        let response: ActionResponse<
          PaginatedMessages | PaginatedDirectMessages
        >;
        if (type === "channel") {
          response = await getMessages({
            cursor: pageParam ? String(pageParam) : undefined,
            channelId: paramValue,
          });
        } else {
          response = await getDirectMessages({
            cursor: pageParam ? String(pageParam) : undefined,
            conversationId: paramValue,
          });
        }

        // Ensure we always return a valid data structure
        if (!response.success || !response.data) {
          return {
            items: [],
            nextCursor: undefined,
          };
        }

        // Return formatted response
        return {
          items: response.data.items,
          nextCursor: response.data.nextCursor,
        };
      } catch (error) {
        console.error("[CHAT_QUERY_ERROR]", error);
        // Return safe empty state on error
        return {
          items: [],
          nextCursor: undefined,
        };
      }
    },

    // Configuration for pagination and polling
    initialPageParam: undefined as undefined | string,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,

    /**
     * Enable polling as fallback when WebSocket is disconnected
     * This ensures continuity of updates even if real-time connection fails
     */
    refetchInterval: isConnected ? false : 1000,

    /**
     * Additional configuration options
     */
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    gcTime: 1000 * 60 * 5, // Keep unused data for 5 minutes

    /**
     * Select function to normalize data structure
     */
    select: (data) => ({
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((message) => ({
          ...message,
          createdAt: new Date(message.createdAt).toISOString(),
          updatedAt: new Date(message.updatedAt).toISOString(),
        })),
      })),
      pageParams: data.pageParams,
    }),
  });
};
