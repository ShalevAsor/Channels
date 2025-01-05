"use server";
import * as z from "zod";
import { db } from "@/lib/db";
import { ChannelSchema } from "@/schemas";
import { currentUserId } from "@/lib/auth";
import { MemberRole } from "@prisma/client";

export const createChannel = async (
  serverId: string,
  values: z.infer<typeof ChannelSchema>
) => {
  try {
    const userId = await currentUserId();
    if (!userId) throw new Error("Unauthorized");
    //validate fields
    const validatedFields = ChannelSchema.safeParse(values);
    if (!validatedFields.success) throw new Error("Invalid fields");
    //destructuring validated fields
    const { name, type } = validatedFields.data;
    if (name === "general") throw new Error("Invalid channel name");
    //create channel
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            userId,
            role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] },
          },
        },
      },
      data: {
        channels: {
          create: {
            userId,
            name,
            type,
          },
        },
      },
    });
    return server;
  } catch (error) {
    console.log("Error in createChannel", error);
    throw error;
  }
};
