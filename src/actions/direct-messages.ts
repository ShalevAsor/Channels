"use server";

import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer, channelName, EVENTS } from "@/lib/pusher";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { ChatInputSchema, MessageFileSchema } from "@/schemas";
import {
  PaginatedDirectMessages,
  DirectMessageWithMemberWithUser,
} from "@/types";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import {
  AuthError,
  ChannelError,
  MemberError,
  MessageError,
  ServerError,
} from "@/lib/errors/app-error";
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

    const channelKey = channelName(conversationId);
    const messageData = JSON.parse(JSON.stringify(message));
    await pusherServer.trigger(channelKey, EVENTS.NEW_MESSAGE, messageData);

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

    const channelKey = channelName(conversationId);
    const messageData = JSON.parse(JSON.stringify(updatedMessage));
    await pusherServer.trigger(channelKey, EVENTS.MESSAGE_UPDATE, messageData);

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

    const channelKey = channelName(conversationId);
    await pusherServer.trigger(
      channelKey,
      EVENTS.MESSAGE_UPDATE,
      deletedMessage
    );

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

    const channelKey = channelName(conversationId);
    console.log("Triggering file message on channel:", channelKey);

    await pusherServer.trigger(channelKey, EVENTS.NEW_MESSAGE, message);

    revalidatePath(`/servers/${serverId}/conversations/${conversationId}`);
    return { success: true, data: message };
  } catch (error) {
    return handleError(error);
  }
}
