"use server";

import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthError, ServerError } from "@/lib/errors/app-error";
import { handleError, ActionResponse } from "@/lib/errors/handle-error";
import { Server } from "@prisma/client";
export const deleteServer = async (
  serverId: string
): Promise<ActionResponse<Server>> => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("You must be logged in to delete a server");
    }
    if (!serverId) {
      throw new ServerError("Server ID is required to delete a server");
    }
    //delete server
    const server = await db.server.delete({
      where: { id: serverId, userId },
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
