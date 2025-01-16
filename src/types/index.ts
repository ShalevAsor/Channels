import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import {
  Member,
  Message,
  Server,
  User,
  DirectMessage,
  Conversation,
} from "@prisma/client";

export type ServerWithMembersWithUsers = Server & {
  members: (Member & { user: User })[];
};

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
/**
 * Extends Message/DirectMessage types with member information
 * This combined type represents a complete message with sender details
 */
export type MessageWithMember = (Message | DirectMessage) & {
  member: Member;
};
// export interface MessageWithMemberWithUser extends Message {
//   member: Member & {
//     user: User;
//   };
// }
// export type MessagesResponse = {
//   items: MessageWithMemberWithUser[];
//   nextCursor?: string;
// };
export type MessageWithMemberWithUser = Message & {
  member: Member & {
    user: User;
  };
};

export type DirectMessageWithMemberWithUser = DirectMessage & {
  member: Member & {
    user: User;
  };
};

export type ChatMessage =
  | MessageWithMemberWithUser
  | DirectMessageWithMemberWithUser;

export interface MessagesResponse {
  items: ChatMessage[];
  nextCursor: string | undefined;
}

export type MessageStatus = "pending" | "sending" | "failed";

export interface PendingMessage {
  id: string;
  content: string;
  fileUrl?: string;
  // Add serverId for channel messages
  serverId?: string; // Added this field
  channelId?: string;
  conversationId?: string;
  memberId?: string; // We might need this for direct messages
  status: MessageStatus;
  retryCount: number;
  createdAt: Date;
}
export type ConversationWithMembers = Conversation & {
  memberOne: Member & {
    user: User;
  };
  memberTwo: Member & {
    user: User;
  };
};

export type PaginatedMessages = {
  items: MessageWithMemberWithUser[];
  nextCursor: string | undefined;
};
export type DirectMessageWithMemberDetails = DirectMessage & {
  member: Member & {
    user: User;
    server: Server;
  };
};

// Define type for paginated response
export type PaginatedDirectMessages = {
  items: DirectMessageWithMemberDetails[];
  nextCursor: string | undefined;
};
