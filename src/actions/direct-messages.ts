"use server";

import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { ChatInputSchema, MessageFileSchema } from "@/schemas";
import {
  PaginatedDirectMessages,
  DirectMessageWithMemberWithUser,
} from "@/types/message";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import {
  AuthError,
  MemberError,
  MessageError,
  ServerError,
} from "@/lib/errors/app-error";
import { broadcastMessage, WSEventType } from "@/lib/websocket";
import { DirectMessage } from "@prisma/client";

const MESSAGES_BATCH = 10;

// Define type for DirectMessage with nested relations

export async function getDirectMessages({
  cursor,
  conversationId,
}: {
  cursor?: string;
  conversationId: string;
}): Promise<ActionResponse<PaginatedDirectMessages>> {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("Unauthorized");
    }

    if (!conversationId) {
      throw new ServerError("Conversation ID is required");
    }

    const messages = await db.directMessage.findMany({
      take: MESSAGES_BATCH + 1,
      where: {
        conversationId,
      },
      include: {
        member: {
          include: {
            user: true,
            server: true,
          },
        },
      },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextCursor: string | undefined;

    if (messages.length > MESSAGES_BATCH) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    return {
      success: true,
      data: {
        items: messages,
        nextCursor,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function createDirectMessage(
  values: z.infer<typeof ChatInputSchema>,
  conversationId: string,
  memberId: string,
  fileUrl: string | null = null
): Promise<ActionResponse<DirectMessageWithMemberWithUser>> {
  try {
    if (!conversationId || !memberId) {
      throw new ServerError("Conversation ID and member ID are required");
    }
    const validatedFields = ChatInputSchema.safeParse(values);
    if (!validatedFields.success) {
      throw new ServerError("Invalid message content");
    }

    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("Unauthorized");
    }

    const member = await db.member.findFirst({
      where: {
        id: memberId,
        userId,
      },
      include: {
        user: true,
        server: true,
      },
    });

    if (!member) {
      throw new MemberError("Member not found");
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ memberOneId: memberId }, { memberTwoId: memberId }],
      },
    });

    if (!conversation) {
      throw new ServerError("Conversation not found");
    }

    const message = await db.directMessage.create({
      data: {
        content: validatedFields.data.content,
        fileUrl,
        conversationId,
        memberId,
      },
      include: {
        member: {
          include: {
            user: true,
            server: true,
          },
        },
      },
    });
    if (!message) {
      throw new MessageError("Message not created");
    }

    // Broadcast the new direct message
    await broadcastMessage<DirectMessage>({
      channelId: conversationId,
      type: WSEventType.NEW_MESSAGE,
      message: message,
      member: message.member,
    });

    revalidatePath(`/conversations/${conversationId}`);
    return { success: true, data: message };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateDirectMessage(
  messageId: string,
  values: z.infer<typeof ChatInputSchema>,
  conversationId: string
): Promise<ActionResponse<DirectMessageWithMemberWithUser>> {
  try {
    if (!messageId) {
      throw new ServerError("Message ID is required");
    }
    if (!conversationId) {
      throw new ServerError("Conversation ID is required");
    }
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("Unauthorized");
    }

    const message = await db.directMessage.findFirst({
      where: {
        id: messageId,
        member: {
          userId,
        },
      },
      include: {
        member: {
          include: {
            user: true,
            server: true,
          },
        },
      },
    });

    if (!message) {
      throw new MessageError("Message not found");
    }

    const updatedMessage = await db.directMessage.update({
      where: {
        id: messageId,
      },
      data: {
        content: values.content,
        edited: true,
      },
      include: {
        member: {
          include: {
            user: true,
            server: true,
          },
        },
      },
    });

    // Broadcast the updated direct message
    await broadcastMessage<DirectMessage>({
      channelId: conversationId,
      type: WSEventType.MESSAGE_UPDATE,
      message: updatedMessage,
      member: updatedMessage.member,
    });

    revalidatePath(`/conversations/${conversationId}`);
    return { success: true, data: updatedMessage };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteDirectMessage(
  messageId: string,
  conversationId: string
): Promise<ActionResponse<DirectMessageWithMemberWithUser>> {
  try {
    if (!messageId) {
      throw new ServerError("Message ID is required");
    }
    if (!conversationId) {
      throw new ServerError("Conversation ID is required");
    }

    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("Unauthorized");
    }

    // First find the message with its member info
    const message = await db.directMessage.findFirst({
      where: {
        id: messageId,
        conversationId,
      },
      include: {
        member: {
          include: {
            user: true,
            server: true,
          },
        },
      },
    });

    if (!message) {
      throw new MessageError("Message not found");
    }

    // Check if the user is the message owner
    if (message.member.userId !== userId) {
      throw new MessageError(
        "You can only delete your own messages in conversations"
      );
    }

    const deletedMessage = await db.directMessage.update({
      where: {
        id: messageId,
      },
      data: {
        content: "This message has been deleted",
        fileUrl: null,
        deleted: true,
        edited: false,
      },
      include: {
        member: {
          include: {
            user: true,
            server: true,
          },
        },
      },
    });

    // Broadcast the deleted message
    await broadcastMessage<DirectMessage>({
      channelId: conversationId,
      type: WSEventType.MESSAGE_DELETE,
      message: deletedMessage,
      member: deletedMessage.member,
    });

    revalidatePath(`/conversations/${conversationId}`);
    return { success: true, data: deletedMessage };
  } catch (error) {
    return handleError(error);
  }
}
export async function createDirectFileMessage(
  values: z.infer<typeof MessageFileSchema>,
  serverId: string,
  conversationId: string
): Promise<ActionResponse<DirectMessageWithMemberWithUser>> {
  try {
    if (!serverId) {
      throw new ServerError("Server ID is required");
    }
    if (!conversationId) {
      throw new ServerError("Conversation ID is required");
    }
    const validatedFields = MessageFileSchema.safeParse(values);
    if (!validatedFields.success) {
      throw new MessageError("Invalid message content");
    }

    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("Unauthorized");
    }

    const member = await db.member.findFirst({
      where: {
        userId,
        serverId,
      },
    });

    if (!member) {
      throw new MemberError("Member not found");
    }

    const message = await db.directMessage.create({
      data: {
        content: "", // Empty content for file messages
        fileUrl: validatedFields.data.fileUrl,
        fileName: validatedFields.data.fileName,
        fileType: validatedFields.data.fileType,
        conversationId,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    // Broadcast the new direct message
    await broadcastMessage<DirectMessage>({
      channelId: conversationId,
      type: WSEventType.NEW_MESSAGE,
      message: message,
      member: message.member,
    });

    revalidatePath(`/servers/${serverId}/conversations/${conversationId}`);
    return { success: true, data: message };
  } catch (error) {
    return handleError(error);
  }
}
