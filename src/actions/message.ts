"use server";

import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { pusherServer, channelName, EVENTS } from "@/lib/pusher";

import * as z from "zod";
import { ChatInputSchema } from "@/schemas";
import { MessageFileSchema } from "@/schemas";
import { MemberRole, Message } from "@prisma/client";
import { PaginatedMessages, MessageWithMemberWithUser } from "@/types";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import {
  AuthError,
  ChannelError,
  MemberError,
  MessageError,
  ServerError,
} from "@/lib/errors/app-error";
const MESSAGES_BATCH = 10;

export async function getMessages({
  cursor,
  channelId,
  conversationId,
}: {
  cursor?: string;
  channelId?: string;
  conversationId?: string;
}): Promise<ActionResponse<PaginatedMessages>> {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("Unauthorized");
    }
    if (!channelId && !conversationId) {
      throw new ServerError("Invalid parameters");
    }
    const messages = await db.message.findMany({
      take: MESSAGES_BATCH + 1,
      where: {
        ...(channelId ? { channelId } : {}),
        ...(conversationId ? { conversationId } : {}),
      },
      include: {
        member: {
          include: {
            user: true,
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

export async function createMessage(
  values: z.infer<typeof ChatInputSchema>,
  serverId: string,
  channelId: string,
  fileUrl: string | null = null
): Promise<ActionResponse<MessageWithMemberWithUser>> {
  try {
    if (!serverId || !channelId) {
      throw new ServerError("Server ID and channel ID are required");
    }
    const validatedFields = ChatInputSchema.safeParse(values);
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

    const message = await db.message.create({
      data: {
        content: validatedFields.data.content,
        fileUrl,
        channelId,
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
    if (!message) {
      throw new MessageError("Message not created");
    }

    const channelKey = channelName(channelId);
    console.log("Triggering message on channel:", channelKey);

    await pusherServer.trigger(channelKey, EVENTS.NEW_MESSAGE, message);

    revalidatePath(`/servers/${serverId}/channels/${channelId}`);
    return { success: true, data: message };
  } catch (error) {
    return handleError(error);
  }
}

export async function editMessage(
  values: z.infer<typeof ChatInputSchema>,
  messageId: string,
  serverId: string,
  channelId: string
): Promise<ActionResponse<MessageWithMemberWithUser>> {
  try {
    if (!serverId) {
      throw new ServerError("Server ID is required");
    }
    if (!channelId) {
      throw new ServerError("Channel ID is required");
    }
    if (!messageId) {
      throw new ServerError("Message ID is required");
    }

    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("Unauthorized");
    }

    // Validate the content first
    const validatedFields = ChatInputSchema.safeParse(values);
    if (!validatedFields.success) {
      throw new MessageError("Invalid message content");
    }
    const { content } = validatedFields.data;

    // First fetch the message with its member info
    const message = await db.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        member: true,
      },
    });

    if (!message) {
      throw new MessageError("Message not found");
    }

    // Explicitly check if the user is the message owner
    if (message.member.userId !== userId) {
      throw new MessageError("You can only edit your own messages");
    }

    // If we get here, the user is authorized to edit the message
    const updatedMessage = await db.message.update({
      where: {
        id: messageId,
      },
      data: {
        content,
        fileUrl: null,
        edited: true,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    // Trigger real-time update
    const channelKey = channelName(channelId);
    await pusherServer.trigger(
      channelKey,
      EVENTS.MESSAGE_UPDATE,
      updatedMessage
    );

    revalidatePath(`/servers/${serverId}/channels/${channelId}`);
    return { success: true, data: updatedMessage };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteMessage(
  messageId: string,
  serverId: string,
  channelId: string
): Promise<ActionResponse<MessageWithMemberWithUser>> {
  try {
    if (!serverId) {
      throw new ServerError("Server ID is required");
    }
    if (!channelId) {
      throw new ServerError("Channel ID is required");
    }
    if (!messageId) {
      throw new ServerError("Message ID is required");
    }

    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("Unauthorized");
    }

    // First get the member trying to delete the message
    const currentMember = await db.member.findFirst({
      where: {
        userId,
        serverId,
      },
      select: {
        role: true,
      },
    });

    if (!currentMember) {
      throw new MemberError("Member not found");
    }

    // Get the message with its member info
    const message = await db.message.findFirst({
      where: {
        id: messageId,
        channelId,
      },
      include: {
        member: true,
      },
    });

    if (!message) {
      throw new MessageError("Message not found");
    }

    // Check if user has permission to delete the message
    const isMessageOwner = message.member.userId === userId;
    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;

    if (!isMessageOwner && !isAdmin && !isModerator) {
      throw new MessageError(
        "You don't have permission to delete this message"
      );
    }

    const deletedMessage = await db.message.update({
      where: {
        id: messageId,
      },
      data: {
        fileUrl: null,
        content: "This message has been deleted",
        deleted: true,
        edited: false,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    const channelKey = channelName(channelId);

    await pusherServer.trigger(
      channelKey,
      EVENTS.MESSAGE_UPDATE,
      deletedMessage
    );

    revalidatePath(`/servers/${serverId}/channels/${channelId}`);
    return { success: true, data: deletedMessage };
  } catch (error) {
    return handleError(error);
  }
}

export async function createFileMessage(
  values: z.infer<typeof MessageFileSchema>,
  serverId: string,
  channelId: string
): Promise<ActionResponse<MessageWithMemberWithUser>> {
  try {
    if (!serverId) {
      throw new ServerError("Server ID is required");
    }
    if (!channelId) {
      throw new ChannelError("Channel ID is required");
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

    const message = await db.message.create({
      data: {
        content: "", // Empty content for file messages
        fileUrl: validatedFields.data.fileUrl,
        fileName: validatedFields.data.fileName,
        fileType: validatedFields.data.fileType,
        channelId,
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

    const channelKey = channelName(channelId);
    console.log("Triggering file message on channel:", channelKey);

    await pusherServer.trigger(channelKey, EVENTS.NEW_MESSAGE, message);

    revalidatePath(`/servers/${serverId}/channels/${channelId}`);
    return { success: true, data: message };
  } catch (error) {
    return handleError(error);
  }
}
