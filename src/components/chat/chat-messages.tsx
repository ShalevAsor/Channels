// "use client";

// import { Member } from "@prisma/client";
// import { format } from "date-fns";
// import { Fragment, useRef } from "react";
// import { Loader2, ServerCrash, ArrowDown } from "lucide-react";

// import { ChatWelcome } from "./chat-welcome";
// import { ChatItem } from "./chat-item";
// import { Button } from "@/components/ui/button";
// import { useChatQuery } from "@/hooks/use-chat-query";
// import { useChatSocket } from "@/hooks/use-chat-socket";
// import { useChatScroll } from "@/hooks/use-chat-scroll";
// import { ChatMessage } from "@/types";
// import { DATE_FORMAT } from "@/constants";

// /**
//  * Props for the ChatMessages component
//  */
// interface ChatMessagesProps {
//   name: string; // Display name of the channel or conversation
//   member: Member; // Current user's member information
//   chatId: string; // Unique identifier for this chat
//   messageParams: {
//     // Parameters for message operations
//     serverId?: string;
//     channelId?: string;
//     conversationId?: string;
//   };
//   paramKey: "channelId" | "conversationId"; // Type of chat identifier
//   paramValue: string; // The actual chat identifier value
//   type: "channel" | "conversation"; // Type of chat
// }

// /**
//  * ChatMessages component handles:
//  * 1. Real-time message updates via WebSocket
//  * 2. Infinite scroll message loading
//  * 3. Scroll position management
//  * 4. Message display and formatting
//  */
// export const ChatMessages = ({
//   name,
//   member,
//   chatId,
//   messageParams,
//   paramKey,
//   paramValue,
//   type,
// }: ChatMessagesProps) => {
//   // Create unique keys for querying and WebSocket channels
//   const queryKey = `${type}:${chatId}`;
//   const channelKey = `chat:${paramValue}`; // Simplified channel naming

//   // Refs for scroll management
//   const chatRef = useRef<HTMLDivElement>(null);
//   const bottomRef = useRef<HTMLDivElement>(null);

//   // Initialize message fetching with React Query
//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
//     useChatQuery({
//       queryKey,
//       paramKey,
//       paramValue,
//       type,
//     });

//   // Initialize WebSocket connection for real-time updates
//   const { isConnected } = useChatSocket({
//     channelKey,
//     queryKey,
//     member,
//   });

//   // Calculate total messages for scroll management
//   const messageCount =
//     data?.pages?.reduce((acc, page) => acc + (page?.items?.length || 0), 0) ??
//     0;

//   // Set up scroll behavior
//   const { showScrollButton, scrollToBottom } = useChatScroll({
//     chatRef,
//     bottomRef,
//     loadMore: fetchNextPage,
//     shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
//     count: messageCount,
//   });

//   // Loading state
//   if (status === "pending" || !data?.pages) {
//     return (
//       <div className="flex flex-col flex-1 justify-center items-center">
//         <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
//         <p className="text-xs text-zinc-500 dark:text-zinc-400">
//           Loading messages...
//         </p>
//       </div>
//     );
//   }

//   // Error state
//   if (status === "error") {
//     return (
//       <div className="flex flex-col flex-1 justify-center items-center">
//         <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
//         <p className="text-xs text-zinc-500 dark:text-zinc-400">
//           Something went wrong!
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
//       {/* Top spacer and welcome message */}
//       {!hasNextPage && <div className="flex-1" />}
//       {!hasNextPage && <ChatWelcome type={type} name={name} />}

//       {/* Load more messages button */}
//       {hasNextPage && (
//         <div className="flex justify-center">
//           {isFetchingNextPage ? (
//             <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
//           ) : (
//             <button
//               onClick={() => fetchNextPage()}
//               className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400
//                        text-xs my-4 dark:hover:text-zinc-300 transition"
//             >
//               Load previous messages
//             </button>
//           )}
//         </div>
//       )}

//       {/* Message list */}
//       <div className="flex flex-col-reverse mt-auto">
//         {data.pages.map((group, i) => (
//           <Fragment key={i}>
//             {group?.items?.map((message) => {
//               // Safely handle both Date and string types
//               const messageDate = new Date(message.createdAt);

//               const updatedDate = new Date(message.updatedAt);

//               return (
//                 <ChatItem
//                   key={message.id}
//                   currentMember={member}
//                   id={message.id}
//                   content={message.content}
//                   member={message.member}
//                   timestamp={format(messageDate, DATE_FORMAT)}
//                   messageParams={messageParams}
//                   fileUrl={message.fileUrl}
//                   fileName={message.fileName}
//                   fileType={message.fileType}
//                   isDeleted={message.deleted}
//                   isEdited={message.edited}
//                   isUpdated={messageDate.getTime() !== updatedDate.getTime()}
//                   type={type}
//                 />
//               );
//             })}
//           </Fragment>
//         ))}
//       </div>

//       {/* Scroll to bottom button */}
//       {showScrollButton && (
//         <Button
//           onClick={scrollToBottom}
//           className="absolute bottom-[100px] right-8 bg-indigo-500
//                    hover:bg-indigo-600 text-white p-2 rounded-full
//                    shadow-lg z-50"
//           size="icon"
//           variant="default"
//         >
//           <ArrowDown className="h-5 w-5" />
//         </Button>
//       )}

//       {/* Bottom anchor for scrolling */}
//       <div ref={bottomRef} />
//     </div>
//   );
// };

"use client";

import { Member } from "@prisma/client";
import { format } from "date-fns";
import { Fragment, useRef } from "react";
import { Loader2, ServerCrash, ArrowDown } from "lucide-react";

import { ChatWelcome } from "./chat-welcome";
import { ChatItem } from "./chat-item";
import { Button } from "@/components/ui/button";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { ChatMessage } from "@/types";
import { DATE_FORMAT } from "@/constants";
import { useChatTyping } from "@/hooks/use-chat-typing";
import { TypingIndicator } from "./typing-indicator";

/**
 * Props for the ChatMessages component
 */
interface ChatMessagesProps {
  name: string; // Display name of the channel or conversation
  member: Member; // Current user's member information
  chatId: string; // Unique identifier for this chat
  messageParams: {
    // Parameters for message operations
    serverId?: string;
    channelId?: string;
    conversationId?: string;
  };
  paramKey: "channelId" | "conversationId"; // Type of chat identifier
  paramValue: string; // The actual chat identifier value
  type: "channel" | "conversation"; // Type of chat
}

/**
 * ChatMessages component handles:
 * 1. Real-time message updates via WebSocket
 * 2. Infinite scroll message loading
 * 3. Scroll position management
 * 4. Message display and formatting
 */
export const ChatMessages = ({
  name,
  member,
  chatId,
  messageParams,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {
  // Create unique keys for querying and WebSocket channels
  const queryKey = `${type}:${chatId}`;
  const channelKey = `chat:${paramValue}`; // Simplified channel naming

  // Refs for scroll management
  const chatRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Initialize message fetching with React Query
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      paramKey,
      paramValue,
      type,
    });

  // Initialize WebSocket connection for real-time updates
  const { isConnected } = useChatSocket({
    channelKey,
    queryKey,
    member,
  });
  // Initialize typing indicator management
  const { typingUsers } = useChatTyping(channelKey, member.userId);

  // Calculate total messages for scroll management
  const messageCount =
    data?.pages?.reduce((acc, page) => acc + (page?.items?.length || 0), 0) ??
    0;

  // Set up scroll behavior
  // Set up scroll behavior with custom thresholds for better UX
  const { showScrollButton, scrollToBottom, isUserScrolling } = useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: messageCount,
    // Custom thresholds for optimized scrolling experience
    thresholds: {
      SHOW_BUTTON: 400, // Show button when 500px from bottom
      AUTO_SCROLL: 200, // Auto-scroll when within 150px of bottom
      LOAD_MORE: 50, // Load more when 50px from top
    },
    // Enable smooth scrolling for better user experience
    smoothScroll: true,
  });

  // Loading state
  if (status === "pending" || !data?.pages) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    );
  }

  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {/* Top spacer and welcome message */}
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}

      {/* Load more messages button */}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 
                       text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}

      {/* Message list */}
      <div className="flex flex-col-reverse mt-auto">
        {typingUsers.length > 0 && (
          <TypingIndicator
            typingUsers={typingUsers}
            currentUserId={member.userId}
          />
        )}
        {data.pages.map((group, i) => (
          <Fragment key={i}>
            {group?.items?.map((message) => {
              // Safely handle both Date and string types
              const messageDate = new Date(message.createdAt);

              const updatedDate = new Date(message.updatedAt);

              return (
                <ChatItem
                  key={message.id}
                  currentMember={member}
                  id={message.id}
                  content={message.content}
                  member={message.member}
                  timestamp={format(messageDate, DATE_FORMAT)}
                  messageParams={messageParams}
                  fileUrl={message.fileUrl}
                  fileName={message.fileName}
                  fileType={message.fileType}
                  isDeleted={message.deleted}
                  isEdited={message.edited}
                  isUpdated={messageDate.getTime() !== updatedDate.getTime()}
                  type={type}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="absolute bottom-[100px] right-8 bg-indigo-500 
                   hover:bg-indigo-600 text-white p-2 rounded-full 
                   shadow-lg z-50"
          size="icon"
          variant="default"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}

      {/* Bottom anchor for scrolling */}
      <div ref={bottomRef} />
    </div>
  );
};
