"use server";
import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { AuthError, MemberError, ServerError } from "@/lib/errors/app-error";
import { handleError, ActionResponse } from "@/lib/errors/handle-error";
import { Server } from "@prisma/client";
export const updateMemberRole = async (
  serverId: string,
  memberId: string,
  role: MemberRole
): Promise<ActionResponse<Server>> => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("You must be logged in to change member role");
    }
    if (!serverId) {
      throw new ServerError("Server information is missing");
    }
    if (!memberId) {
      throw new MemberError("Member information is missing");
    }
    const server = await db.server.update({
      where: { id: serverId, userId },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
              userId: { not: userId },
            },
            data: { role },
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
