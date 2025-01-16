// "use client";

// import { Member } from "@prisma/client";
// import { format } from "date-fns";
// import { DATE_FORMAT } from "@/constants";
// import { ChatWelcome } from "./chat-welcome";
// import { useChatQuery } from "@/hooks/use-chat-query";
// import { Loader2, ServerCrash, ArrowDown } from "lucide-react";
// import { Fragment, useRef } from "react";
// import { MessageWithMemberWithUser } from "@/types";
// import { ChatItem } from "./chat-item";
// import { useChatSocket } from "@/hooks/use-chat-socket";
// import { useChatScroll } from "@/hooks/use-chat-scroll";
// import { Button } from "@/components/ui/button";
// import { channelName } from "@/lib/pusher";

// interface ChatMessagesProps {
//   name: string;
//   member: Member;
//   chatId: string;
//   apiUrl: string;
//   socketUrl: string;
//   socketQuery: Record<string, string>;
//   paramKey: "channelId" | "conversationId";
//   paramValue: string;
//   type: "channel" | "conversation";
// }

// export const ChatMessages = ({
//   name,
//   member,
//   chatId,
//   apiUrl,
//   socketUrl,
//   socketQuery,
//   paramKey,
//   paramValue,
//   type,
// }: ChatMessagesProps) => {
//   const queryKey = `chat:${chatId}`;
//   const channelKey = channelName(chatId);

//   const chatRef = useRef<HTMLDivElement>(null);
//   const bottomRef = useRef<HTMLDivElement>(null);

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
//     useChatQuery({
//       queryKey,
//       paramKey,
//       paramValue,
//     });

//   useChatSocket({
//     addKey: channelKey,
//     updateKey: channelKey,
//     queryKey,
//   });

//   const messageCount =
//     data?.pages?.reduce((acc, page) => acc + page.items.length, 0) ?? 0;

//   const { showScrollButton, scrollToBottom } = useChatScroll({
//     chatRef,
//     bottomRef,
//     loadMore: fetchNextPage,
//     shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
//     count: messageCount,
//   });

//   if (status === "pending") {
//     return (
//       <div className="flex flex-col flex-1 justify-center items-center">
//         <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
//         <p className="text-xs text-zinc-500 dark:text-zinc-400">
//           Loading messages...
//         </p>
//       </div>
//     );
//   }

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
//       {!hasNextPage && <div className="flex-1" />}
//       {!hasNextPage && <ChatWelcome type={type} name={name} />}
//       {hasNextPage && (
//         <div className="flex justify-center">
//           {isFetchingNextPage ? (
//             <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
//           ) : (
//             <button
//               onClick={() => fetchNextPage()}
//               className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
//             >
//               Load previous messages
//             </button>
//           )}
//         </div>
//       )}
//       <div className="flex flex-col-reverse mt-auto">
//         {data?.pages?.map((group, i) => (
//           <Fragment key={i}>
//             {group.items.map((message: MessageWithMemberWithUser) => (
//               <ChatItem
//                 key={message.id}
//                 currentMember={member}
//                 id={message.id}
//                 content={message.content}
//                 member={message.member}
//                 timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
//                 fileUrl={message.fileUrl}
//                 fileName={message.fileName}
//                 fileType={message.fileType}
//                 socketQuery={socketQuery}
//                 socketUrl={socketUrl}
//                 isDeleted={message.deleted}
//                 isEdited={message.edited}
//                 isUpdated={message.updatedAt !== message.createdAt}
//               />
//             ))}
//           </Fragment>
//         ))}
//       </div>
//       {showScrollButton && (
//         <Button
//           onClick={scrollToBottom}
//           className="absolute bottom-[100px] right-8 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow-lg z-50"
//           size="icon"
//           variant="default"
//         >
//           <ArrowDown className="h-5 w-5" />
//         </Button>
//       )}
//       <div ref={bottomRef} />
//     </div>
//   );
// };
"use client";

import { Member } from "@prisma/client";
import { format } from "date-fns";
import { DATE_FORMAT } from "@/constants";
import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2, ServerCrash, ArrowDown } from "lucide-react";
import { Fragment, useRef } from "react";
import { ChatMessage } from "@/types";
import { ChatItem } from "./chat-item";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { Button } from "@/components/ui/button";
import { channelName } from "@/lib/pusher";

interface ChatMessagesProps {
  name: string; // Display name of the channel or conversation
  member: Member; // The current user's member information
  chatId: string; // Unique identifier for this chat
  messageParams: {
    // Renamed from socketQuery
    serverId?: string;
    channelId?: string;
    conversationId?: string;
  };
  paramKey: "channelId" | "conversationId"; // Identifies the type of chat ID
  paramValue: string; // The actual ID value for the chat
  type: "channel" | "conversation"; // Whether this is a channel or direct message chat
}
/**
 * ChatMessages is a complex component that handles:
 * 1. Message display with infinite scrolling
 * 2. Real-time message updates
 * 3. Scroll position management
 * 4. Loading states
 * 5. Message organization and formatting
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
  // Create unique keys for querying and real-time updates
  const queryKey = `${type}:${chatId}`;
  const channelKey = channelName(chatId);
  // Refs for scroll management
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Set up message fetching and real-time updates
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      paramKey,
      paramValue,
      type,
    });
  // Initialize real-time socket connection
  useChatSocket({
    channelKey: channelKey,
    queryKey,
  });
  // Calculate total number of messages for scroll management
  const messageCount =
    data?.pages?.reduce((acc, page) => acc + page.items.length, 0) ?? 0;
  // Set up scroll behavior management
  const { showScrollButton, scrollToBottom } = useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: messageCount,
  });

  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

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
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message: ChatMessage) => (
              <ChatItem
                key={message.id}
                currentMember={member}
                id={message.id}
                content={message.content}
                member={message.member}
                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                messageParams={messageParams}
                fileUrl={message.fileUrl}
                fileName={message.fileName}
                fileType={message.fileType}
                isDeleted={message.deleted}
                isEdited={message.edited}
                isUpdated={message.updatedAt !== message.createdAt}
                type={type}
              />
            ))}
          </Fragment>
        ))}
      </div>
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="absolute bottom-[100px] right-8 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow-lg z-50"
          size="icon"
          variant="default"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
