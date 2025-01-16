"use server";
import { v4 as uuid } from "uuid";
import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import { AuthError, ServerError } from "@/lib/errors/app-error";
import { Server } from "@prisma/client";
export const generateNewInviteCode = async (
  serverId: string
): Promise<ActionResponse<Server>> => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("You must be logged in to generate an invite code");
    }
    if (!serverId) {
      throw new ServerError("Server ID is required to generate an invite code");
    }
    const server = await db.server.update({
      where: { id: serverId, userId },
      data: { inviteCode: uuid() },
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
