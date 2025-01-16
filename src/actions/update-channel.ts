"use server";
import * as z from "zod";
import { db } from "@/lib/db";
import { ChannelSchema } from "@/schemas";
import { currentUserId } from "@/lib/auth";
import { MemberRole, Server } from "@prisma/client";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import { ChannelError, ServerError } from "@/lib/errors/app-error";

export const updateChannel = async (
  serverId: string,
  channelId: string,
  values: z.infer<typeof ChannelSchema>
): Promise<ActionResponse<Server>> => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new ServerError("You must be logged in to update a channel");
    }
    if (!serverId) {
      throw new ServerError("Server id is required");
    }
    if (!channelId) {
      throw new ChannelError("Channel id is required");
    }
    //validate fields
    const validatedFields = ChannelSchema.safeParse(values);
    if (!validatedFields.success) {
      throw new ChannelError("Invalid channel data");
    }
    //destructuring validated fields
    const { name, type } = validatedFields.data;
    if (name === "general") {
      throw new ChannelError("Channel name cannot be 'general'");
    }
    //create channel
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            userId,
            role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: channelId,
              NOT: {
                name: "general",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });
    if (!server) {
      throw new ServerError("Server not found");
    }
    return {
      success: true,
      data: server,
    };
  } catch (error) {
    return handleError(error);
  }
};
