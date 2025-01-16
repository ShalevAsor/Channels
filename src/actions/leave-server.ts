"use server";

import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AuthError, ServerError } from "@/lib/errors/app-error";
import { handleError, ActionResponse } from "@/lib/errors/handle-error";
import { Server } from "@prisma/client";
export const leaveServer = async (
  serverId: string
): Promise<ActionResponse<Server>> => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("You must be logged in to leave a server");
    }
    if (!serverId) {
      throw new ServerError("Server ID is required to leave a server");
    }
    const server = await db.server.update({
      where: {
        id: serverId,
        userId: {
          not: userId,
        },
        members: {
          some: {
            userId,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            userId,
          },
        },
      },
    });
    if (!server) {
      throw new ServerError("Server not found");
    }
    revalidatePath(`/servers/${serverId}`);
    return {
      success: true,
      data: server,
    };
  } catch (error) {
    return handleError(error);
  }
};
