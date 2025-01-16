"use server";
import { db } from "@/lib/db";
import { ChannelError } from "@/lib/errors/app-error";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import { Channel } from "@prisma/client";

export const getChannelById = async (
  channelId: string
): Promise<ActionResponse<Channel>> => {
  try {
    if (!channelId) {
      throw new ChannelError("Channel id is required");
    }
    const channel = await db.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    if (!channel) {
      throw new ChannelError("Channel not found");
    }
    return {
      success: true,
      data: channel,
    };
  } catch (error) {
    return handleError(error);
  }
};
