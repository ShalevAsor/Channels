// "use client";

// import { Member, User } from "@prisma/client";
// import UserAvatar from "@/components/user-avatar";
// import { ActionTooltip } from "../action-tooltip";
// import { Crown, Edit, Loader2, Shield, ShieldCheck, Trash } from "lucide-react";
// import { useState } from "react";
// import { ChatFileItem } from "./chat-file-item";
// import { cn } from "@/lib/utils";

// import { ChatEditMessage } from "./chat-edit-message";
// import { deleteMessage } from "@/actions/message";
// import { useRouter, useParams } from "next/navigation";
// import { useModalStore } from "@/stores/use-modal-store";
// interface ChatItemProps {
//   id: string;
//   content: string;
//   member: Member & {
//     user: User;
//   };
//   timestamp: string;
//   fileUrl?: string | null;
//   fileType?: string | null;
//   fileName?: string | null;
//   currentMember: Member;
//   isDeleted: boolean;
//   isUpdated: boolean;
//   isEdited: boolean;
//   socketUrl: string;
//   socketQuery: Record<string, string>;
// }
// export const ChatItem = ({
//   id,
//   content,
//   member,
//   timestamp,
//   fileUrl,
//   fileName,
//   fileType,
//   currentMember,
//   socketQuery,
//   socketUrl,
//   isEdited,
//   isDeleted,
//   isUpdated,
// }: ChatItemProps) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const { onOpen } = useModalStore();
//   const router = useRouter();
//   const params = useParams();
//   const isAdmin = currentMember.role === "ADMIN";
//   const isModerator = currentMember.role === "MODERATOR";
//   const isOwner = currentMember.id === member.id;
//   const canDeleteMessage = !isDeleted && (isOwner || isAdmin || isModerator);
//   const canEditMessage = !isDeleted && isOwner && !fileUrl;

//   const roleIconMap = {
//     GUEST: <Shield className="h-4 w-4 ml-2 text-zinc-500" />,
//     MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
//     ADMIN: <Crown className="h-4 w-4 ml-2 text-rose-500" />,
//   };

//   const onMemberClick = () => {
//     if (member.id === currentMember.id) {
//       return;
//     }
//     router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
//   };

//   return (
//     <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
//       <div className="group flex gap-x-2 items-start w-full">
//         <div
//           onClick={onMemberClick}
//           className="cursor-pointer hover:drop-shadow-md transition"
//         >
//           <UserAvatar src={member.user.image || undefined} />
//         </div>
//         <div className="flex flex-col w-full">
//           <div className="flex-items-center gap-x-2">
//             <div className="flex items-center">
//               <p
//                 onClick={onMemberClick}
//                 className="font-semibold text-xm hover:underline cursor-pointer"
//               >
//                 {member.user.name}
//               </p>
//               <ActionTooltip label={member.role}>
//                 {roleIconMap[member.role]}
//               </ActionTooltip>
//             </div>
//             <span className="text-xs text-zinc-500 dark:text-zinc-400">
//               {timestamp}
//             </span>
//           </div>
//           {fileUrl && (
//             <ChatFileItem
//               fileUrl={fileUrl}
//               fileName={fileName || undefined}
//               fileType={fileType || undefined}
//               content={content}
//             />
//           )}
//           {!fileUrl && !isEditing && (
//             <p
//               className={cn(
//                 "text-sm text-zinc-600 dark:text-zinc-300",
//                 isDeleted &&
//                   "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
//               )}
//             >
//               {content}
//               {isEdited && !isDeleted && (
//                 <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
//                   (edited)
//                 </span>
//               )}
//             </p>
//           )}
//           {!fileUrl && isEditing && (
//             <ChatEditMessage
//               content={content}
//               setIsEditing={setIsEditing}
//               serverId={socketQuery.serverId}
//               channelId={socketQuery.channelId}
//               messageId={id}
//             />
//           )}
//         </div>
//       </div>
//       {canDeleteMessage && (
//         <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
//           {canEditMessage && (
//             <ActionTooltip label="Edit">
//               <Edit
//                 onClick={() => setIsEditing(true)}
//                 className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
//               />
//             </ActionTooltip>
//           )}
//           <ActionTooltip label="Delete">
//             <Trash
//               onClick={() =>
//                 onOpen("deleteMessage", {
//                   apiUrl: socketUrl,
//                   query: {
//                     serverId: socketQuery.serverId,
//                     channelId: socketQuery.channelId,
//                     messageId: id,
//                   },
//                 })
//               }
//               className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
//             />
//           </ActionTooltip>
//         </div>
//       )}
//     </div>
//   );
// };
"use client";

import { Member, User } from "@prisma/client";
import UserAvatar from "@/components/user-avatar";
import { ActionTooltip } from "../action-tooltip";
import { Crown, Edit, Shield, ShieldCheck, Trash } from "lucide-react";
import { useState } from "react";
import { ChatFileItem } from "./chat-file-item";
import { cn } from "@/lib/utils";
import { ChatEditMessage } from "./chat-edit-message";
import { useRouter, useParams } from "next/navigation";
import { useModalStore } from "@/stores/use-modal-store";

/**
 * Props for rendering a single chat message item
 * Includes message content, sender info, and interaction capabilities
 */
interface ChatItemProps {
  id: string; // Message unique identifier
  content: string; // Message text content
  member: Member & {
    // Message sender information
    user: User; // Including user profile
  };
  timestamp: string; // Formatted message timestamp
  fileUrl?: string | null; // Optional attached file URL
  fileType?: string | null; // Type of attached file
  fileName?: string | null; // Name of attached file
  currentMember: Member; // Currently logged-in member
  isDeleted: boolean; // Whether message is soft-deleted
  isUpdated: boolean; // Whether message has been modified
  isEdited: boolean; // Whether to show edit indicator
  messageParams: {
    // Parameters for message operations
    serverId?: string; // Server ID for channel messages
    channelId?: string; // Channel ID for channel messages
    conversationId?: string; // Conversation ID for direct messages
  };
  type: "channel" | "conversation"; // Context of the message
}

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  fileName,
  fileType,
  currentMember,
  messageParams,
  isEdited,
  isDeleted,
  isUpdated,
  type,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModalStore();
  const router = useRouter();
  const params = useParams();

  // Permission checks
  const isAdmin = currentMember.role === "ADMIN";
  const isModerator = currentMember.role === "MODERATOR";
  const isOwner = currentMember?.id === member.id;
  const canDeleteMessage = !isDeleted && (isOwner || isAdmin || isModerator);
  const canEditMessage = !isDeleted && isOwner && !fileUrl;

  // Role icons mapping
  const roleIconMap = {
    GUEST: <Shield className="h-4 w-4 ml-2 text-zinc-500" />,
    MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
    ADMIN: <Crown className="h-4 w-4 ml-2 text-rose-500" />,
  };

  // Handle clicking on member avatar/name
  const onMemberClick = () => {
    if (member.id === currentMember.id) return;
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  // Prepare parameters for delete modal
  const getMessageOperationParams = () => {
    const params =
      type === "channel"
        ? {
            context: {
              channel: {
                serverId: messageParams.serverId!,
                channelId: messageParams.channelId!,
              },
              message: {
                messageId: id,
              },
            },
          }
        : {
            context: {
              conversation: {
                conversationId: messageParams.conversationId!,
              },
              message: {
                messageId: id,
              },
            },
          };

    return params;
  };

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      {/* Message layout structure remains the same */}
      <div className="group flex gap-x-2 items-start w-full">
        {/* Avatar section */}
        <div
          onClick={onMemberClick}
          className="cursor-pointer hover:drop-shadow-md transition"
        >
          <UserAvatar src={member.user.image || undefined} />
        </div>

        {/* Message content section */}
        <div className="flex flex-col w-full">
          {/* Header with username and timestamp */}
          <div className="flex-items-center gap-x-2">
            <div className="flex items-center">
              <p
                onClick={onMemberClick}
                className="font-semibold text-xm hover:underline cursor-pointer"
              >
                {member.user.name}
              </p>
              <ActionTooltip label={member.role}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>

          {/* File attachment if present */}
          {fileUrl && (
            <ChatFileItem
              fileUrl={fileUrl}
              fileName={fileName || undefined}
              fileType={fileType || undefined}
              content={content}
            />
          )}

          {/* Message content display */}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                isDeleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {content}
              {isEdited && !isDeleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}

          {/* Edit message form when editing */}
          {!fileUrl && isEditing && (
            <ChatEditMessage
              content={content}
              setIsEditing={setIsEditing}
              messageId={id}
              type={type}
              {...messageParams}
            />
          )}
        </div>
      </div>

      {/* Action buttons (edit/delete) */}
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  messageId: id,
                  serverId: messageParams.serverId,
                  channelId: messageParams.channelId,
                  conversationId: messageParams.conversationId,
                })
              }
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};
