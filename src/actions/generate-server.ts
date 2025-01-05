"use server";
import { v4 as uuid } from "uuid";
import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
export const generateNewInviteCode = async (serverId: string) => {
  try {
    const userId = await currentUserId();
    if (!userId) throw new Error("Unauthorized");

    const server = await db.server.update({
      where: { id: serverId, userId },
      data: { inviteCode: uuid() },
    });
    revalidatePath(`/servers/${serverId}`);
    return server;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to generate invite code");
  }
};
