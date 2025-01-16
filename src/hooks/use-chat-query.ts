// // import { useInfiniteQuery } from "@tanstack/react-query";
// // import { usePusher } from "@/components/providers/pusher-provider";
// // import { getMessages } from "@/actions/message";
// // import { MessageWithMemberWithUser, MessagesResponse } from "@/types";

// // interface ChatQueryProps {
// //   queryKey: string;
// //   paramKey: "channelId" | "conversationId";
// //   paramValue: string;
// // }

// // export const useChatQuery = ({
// //   queryKey,
// //   paramKey,
// //   paramValue,
// // }: ChatQueryProps) => {
// //   const { isConnected } = usePusher();

// //   const {
// //     data,
// //     fetchNextPage,
// //     hasNextPage,
// //     isFetchingNextPage,
// //     status,
// //     error,
// //   } = useInfiniteQuery({
// //     queryKey: [queryKey],
// //     queryFn: async ({ pageParam }) => {
// //       try {
// //         return await getMessages({
// //           cursor: pageParam ? String(pageParam) : undefined,
// //           [paramKey]: paramValue,
// //         });
// //       } catch (error) {
// //         console.error("[CHAT_QUERY_ERROR]", error);
// //         throw error;
// //       }
// //     },
// //     initialPageParam: undefined as undefined | string,
// //     getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
// //     refetchInterval: isConnected ? false : 1000,
// //     staleTime: 60 * 1000, // 1 minute
// //     gcTime: 5 * 60 * 1000, // 5 minutes
// //   });

// //   return {
// //     data,
// //     fetchNextPage,
// //     hasNextPage,
// //     isFetchingNextPage,
// //     status,
// //     error,
// //   };
// // };
// // hooks/use-chat-query.ts
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { usePusher } from "@/components/providers/pusher-provider";
// import { getMessages } from "@/actions/message";
// import { getDirectMessages } from "@/actions/direct-messages";
// /**
//  * Props for configuring the chat query behavior
//  */
// interface ChatQueryProps {
//   // Unique identifier for this query in React Query's cache
//   queryKey: string;
//   // Type of chat we're querying
//   paramKey: "channelId" | "conversationId";
//   // ID of the channel or conversation
//   paramValue: string;
//   // Whether this is a channel or direct message chat
//   type: "channel" | "conversation";
// }
// /**
//  * Custom hook that manages fetching and pagination of chat messages
//  * Integrates with Pusher for real-time updates and React Query for data caching
//  *
//  * This hook provides:
//  * - Infinite scrolling functionality
//  * - Real-time updates through Pusher
//  * - Fallback polling when Pusher connection is lost
//  * - Caching and data synchronization
//  */
// export const useChatQuery = ({
//   queryKey,
//   paramKey,
//   paramValue,
//   type,
// }: ChatQueryProps) => {
//   // Get Pusher connection state to determine if we need fallback polling
//   const { isConnected } = usePusher();
//   // Set up infinite query with React Query
//   const {
//     data, // Contains all fetched pages of messages
//     fetchNextPage, // Function to load more messages
//     hasNextPage, // Whether more messages are available
//     isFetchingNextPage, // Loading state for pagination
//     status, // Overall query status
//     error, // Any errors that occurred
//   } = useInfiniteQuery({
//     queryKey: [queryKey],
//     // Function that fetches a page of messages
//     queryFn: async ({ pageParam }) => {
//       try {
//         // Choose between channel messages or direct messages
//         if (type === "channel") {
//           return await getMessages({
//             cursor: pageParam ? String(pageParam) : undefined,
//             channelId: paramValue,
//           });
//         } else {
//           return await getDirectMessages({
//             cursor: pageParam ? String(pageParam) : undefined,
//             conversationId: paramValue,
//           });
//         }
//       } catch (error) {
//         console.error("[CHAT_QUERY_ERROR]", error);
//         throw error;
//       }
//     },
//     // Start with no cursor for first page
//     initialPageParam: undefined as undefined | string,
//     // Extract the cursor for the next page from the current page's response
//     getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
//     // Enable polling only when Pusher is disconnected
//     refetchInterval: isConnected ? false : 1000,
//   });

//   return {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     status,
//     error,
//   };
// };
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { usePusher } from "@/components/providers/pusher-provider";
// import { getMessages } from "@/actions/message";
// import { MessageWithMemberWithUser, MessagesResponse } from "@/types";

// interface ChatQueryProps {
//   queryKey: string;
//   paramKey: "channelId" | "conversationId";
//   paramValue: string;
// }

// export const useChatQuery = ({
//   queryKey,
//   paramKey,
//   paramValue,
// }: ChatQueryProps) => {
//   const { isConnected } = usePusher();

//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     status,
//     error,
//   } = useInfiniteQuery({
//     queryKey: [queryKey],
//     queryFn: async ({ pageParam }) => {
//       try {
//         return await getMessages({
//           cursor: pageParam ? String(pageParam) : undefined,
//           [paramKey]: paramValue,
//         });
//       } catch (error) {
//         console.error("[CHAT_QUERY_ERROR]", error);
//         throw error;
//       }
//     },
//     initialPageParam: undefined as undefined | string,
//     getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
//     refetchInterval: isConnected ? false : 1000,
//     staleTime: 60 * 1000, // 1 minute
//     gcTime: 5 * 60 * 1000, // 5 minutes
//   });

//   return {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     status,
//     error,
//   };
// };
// hooks/use-chat-query.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { usePusher } from "@/components/providers/pusher-provider";
import { getMessages } from "@/actions/message";
import { getDirectMessages } from "@/actions/direct-messages";
import { ActionResponse } from "@/lib/errors/handle-error";
import { PaginatedDirectMessages, PaginatedMessages } from "@/types";
/**
 * Props for configuring the chat query behavior
 */
interface ChatQueryProps {
  // Unique identifier for this query in React Query's cache
  queryKey: string;
  // Type of chat we're querying
  paramKey: "channelId" | "conversationId";
  // ID of the channel or conversation
  paramValue: string;
  // Whether this is a channel or direct message chat
  type: "channel" | "conversation";
}
/**
 * Custom hook that manages fetching and pagination of chat messages
 * Integrates with Pusher for real-time updates and React Query for data caching
 *
 * This hook provides:
 * - Infinite scrolling functionality
 * - Real-time updates through Pusher
 * - Fallback polling when Pusher connection is lost
 * - Caching and data synchronization
 */
export const useChatQuery = ({
  queryKey,
  paramKey,
  paramValue,
  type,
}: ChatQueryProps) => {
  // Get Pusher connection state to determine if we need fallback polling
  const { isConnected } = usePusher();
  // Set up infinite query with React Query
  const {
    data, // Contains all fetched pages of messages
    fetchNextPage, // Function to load more messages
    hasNextPage, // Whether more messages are available
    isFetchingNextPage, // Loading state for pagination
    status, // Overall query status
    error, // Any errors that occurred
  } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: async ({ pageParam }) => {
      try {
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

        if (!response.success) {
          throw new Error(response.error.message);
        }

        return response.data;
      } catch (error) {
        console.error("[CHAT_QUERY_ERROR]", error);
        throw error;
      }
    },
    initialPageParam: undefined as undefined | string,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    refetchInterval: isConnected ? false : 1000,
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  };
};
