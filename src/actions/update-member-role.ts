"use server";
import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const updateMemberRole = async (
  serverId: string,
  memberId: string,
  role: MemberRole
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
    revalidatePath(`/server/${server.id}`);
    return server;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
