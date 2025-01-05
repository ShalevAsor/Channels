"use server";

import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const leaveServer = async (serverId: string) => {
  try {
    const userId = await currentUserId();
    if (!userId) throw new Error("Unauthorized");
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
    revalidatePath(`/servers/${serverId}`);
    return server;
  } catch (error) {
    console.log("leaverServer action Error", error);
    throw error;
  }
};
