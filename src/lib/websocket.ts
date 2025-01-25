// lib/websocket.ts

import axios from "axios";

import {
  Message,
  DirectMessage,
  Member,
  User,
  MemberRole,
} from "@prisma/client";

export enum WSEventType {
  NEW_MESSAGE = "new-message",
  MESSAGE_UPDATE = "message-update",
  MESSAGE_DELETE = "message-delete",
  MEMBER_TYPING = "member-typing",
  MEMBER_STOP_TYPING = "member-stop-typing",
  MEMBER_STATUS_UPDATE = "MEMBER_STATUS_UPDATE",
}
export interface StatusUpdatePayload {
  userId: string;
  isOnline: boolean;
  onlineUsers: string[];
  serverPresence: string[]; // Added for cross-server presence
}

export type WebSocketPayload = BaseMessagePayload | StatusUpdatePayload;
export interface WebSocketAuthToken {
  userId: string;
  name: string | null;
  image: string | null;
  exp: number;
}
export interface WsAuthErrorPayload {
  code: "unauthorized" | "token_expired" | "invalid_token";
  message: string;
}
// Base message payload interface
export interface BaseMessagePayload {
  id: string;
  content: string;
  fileUrl: string | null;
  fileType: string | null;
  fileName: string | null;
  memberId: string;
  userId: string;
  username: string;
  userImage: string | null;
  timestamp: string;
  deleted?: boolean;
  edited?: boolean;
  member: {
    id: string;
    role: MemberRole;
    userId: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}

// Generic broadcast options interface
interface BroadcastOptions<T = Message | DirectMessage> {
  channelId: string; // This can be either channelId or conversationId
  type: WSEventType;
  message: T;
  member: Member & {
    user: User;
  };
}

/**
 * Formats a message for broadcasting
 */
const formatMessagePayload = (
  message: Message | DirectMessage,
  member: Member & { user: User }
): BaseMessagePayload => ({
  id: message.id,
  content: message.content,
  fileUrl: message.fileUrl,
  fileType: message.fileType,
  fileName: message.fileName,
  memberId: member.id,
  userId: member.userId,
  username: member.user.name || "Anonymous",
  userImage: member.user.image,
  timestamp: message.createdAt.toISOString(),
  member: {
    id: member.id,
    role: member.role,
    userId: member.userId,
    user: {
      id: member.user.id,
      name: member.user.name,
      image: member.user.image,
    },
  },
});

/**
 * Broadcasts a message via WebSocket server
 */
export const broadcastMessage = async <T extends Message | DirectMessage>({
  channelId,
  type,
  message,
  member,
}: BroadcastOptions<T>): Promise<void> => {
  const wsHttpUrl =
    process.env.NEXT_PUBLIC_WEBSOCKET_HTTP_URL || "http://localhost:3001";

  try {
    await axios.post(`${wsHttpUrl}/api/broadcast`, {
      type,
      channelName: `chat:${channelId}`,
      message: formatMessagePayload(message, member),
    });
  } catch (error) {
    console.error("[BROADCAST_ERROR]", error);
    // The message is saved in DB and will be available through polling
  }
};
/**
 * Helper function to get channel name for WebSocket
 */
export const getChannelName = (channelId: string): string =>
  `chat:${channelId}`;
