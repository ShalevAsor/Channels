"use server";

import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AuthError, ServerError } from "@/lib/errors/app-error";
import { handleError, ActionResponse } from "@/lib/errors/handle-error";
import { Server } from "@prisma/client";
export const kickMemberFromServer = async (
  serverId: string,
  memberId: string
): Promise<ActionResponse<Server>> => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("You must be logged in to kick a member");
    }
    const server = await db.server.update({
      where: { id: serverId, userId },
      data: {
        members: {
          deleteMany: {
            id: memberId,
            userId: { not: userId },
          },
        },
      },
      include: {
        members: {
          include: { user: true },
          orderBy: { role: "asc" },
        },
      },
    });
    if (!server) {
      throw new ServerError("Server not found");
    }
    revalidatePath(`/servers/${server.id}`);
    return {
      success: true,
      data: server,
    };
  } catch (error) {
    return handleError(error);
  }
};
