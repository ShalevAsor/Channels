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
  MemberRole,
} from "@prisma/client";
export interface ServerInsights {
  mostActiveServer: {
    id: string;
    name: string;
    messageCount: number;
  } | null;
  serverGrowth: {
    id: string;
    name: string;
    growthRate: number;
  } | null;
  newServersCount: number;
}

export interface UserActivity {
  messagesSent: number;
  serversJoined: number;
  channelsParticipating: number;
}

export interface RecommendedServer {
  id: string;
  name: string;
  category: string | null;
  memberCount: number;
}

export interface InsightsData {
  serverInsights: ServerInsights;
  userActivity: UserActivity;
  recommendedServers: RecommendedServer[];
}
export type ServerWithMembersWithUsers = Server & {
  members: (Member & { user: User })[];
};
export type ServerWithMemberInfo = Server & {
  members: {
    id: string;
    role: MemberRole;
    userId: string;
  }[];
  _count: {
    members: number;
  };
};
export type ServerWithMemberCount = Server & {
  _count: {
    members: number;
  };
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
export type MemberWithUser = Member & {
  user: User;
};
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

// ***********************************
// Chat types
// ***********************************
// types/index.ts

/**
 * Base message interface with common properties
 */
export interface BaseMessage {
  id: string;
  content: string;
  fileUrl: string | null;
  fileType: string | null;
  fileName: string | null;
  deleted: boolean;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Extended message interface including member information
 */

/**
 * Member information for chat messages
 */
export interface ChatMember extends Member {
  user: User;
}

/**
 * Paginated response structure for messages
 */

/**
 * Direct message specific pagination
 */

/**
 * Query parameters for fetching messages
 */
export interface MessageQueryParams {
  cursor?: string;
  limit?: number;
  channelId?: string;
  conversationId?: string;
}

export type UserInfo = {
  memberId: string;
  role: MemberRole;
};
