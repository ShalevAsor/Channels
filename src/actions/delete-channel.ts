"use server";

import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { MemberRole, Server } from "@prisma/client";
import { AuthError, ChannelError, ServerError } from "@/lib/errors/app-error";
import { handleError, ActionResponse } from "@/lib/errors/handle-error";
export const deleteChannel = async (
  serverId: string,
  channelId: string
): Promise<ActionResponse<Server>> => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("You must be logged in to delete a channel");
    }
    if (!serverId) {
      throw new ServerError("Server ID is missing");
    }
    //delete channel
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            userId,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: channelId,
            name: {
              not: "general",
            },
          },
        },
      },
    });
    if (!server) {
      throw new ChannelError("Channel not found");
    }
    return {
      success: true,
      data: server,
    };
  } catch (error) {
    return handleError(error);
  }
};
