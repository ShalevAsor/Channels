"use server";
import * as z from "zod";
import { db } from "@/lib/db";
import { ChannelSchema } from "@/schemas";
import { currentUserId } from "@/lib/auth";
import { MemberRole, Server } from "@prisma/client";
import { AuthError, ChannelError, ServerError } from "@/lib/errors/app-error";
import { handleError, ActionResponse } from "@/lib/errors/handle-error";
export const createChannel = async (
  serverId: string,
  values: z.infer<typeof ChannelSchema>
): Promise<ActionResponse<Server>> => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("You must be logged in to create a channel");
    }
    if (!serverId) {
      throw new ServerError("Server ID is required to create a channel");
    }
    //validate fields
    const validatedFields = ChannelSchema.safeParse(values);
    if (!validatedFields.success) {
      throw new ChannelError("Invalid channel details provided");
    }
    //destructuring validated fields
    const { name, type } = validatedFields.data;
    if (name === "general") {
      throw new ChannelError("'general' is a reserved channel name");
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
          create: {
            userId,
            name,
            type,
          },
        },
      },
    });
    if (!server) {
      // This is a server-related error
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
