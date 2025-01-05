"use server";

import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const kickMemberFromServer = async (
  serverId: string,
  memberId: string
) => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
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
    revalidatePath(`/servers/${server.id}`);
    return server;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
