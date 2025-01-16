"use server";
import { db } from "@/lib/db";
import { v4 as uuid } from "uuid";
import * as z from "zod";
import { InitialFormSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import { MemberRole, Server } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { currentUserId } from "@/lib/auth";
import { AuthError, ServerError } from "@/lib/errors/app-error";
import { handleError, ActionResponse } from "@/lib/errors/handle-error";
export const createServer = async (
  values: z.infer<typeof InitialFormSchema>
): Promise<ActionResponse<Server>> => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new AuthError("You must be logged in to create a server");
    }
    const user = await getUserById(userId);
    if (!user) {
      throw new AuthError("User not found");
    }
    //validate fields
    const validatedFields = InitialFormSchema.safeParse(values);
    if (!validatedFields.success) {
      throw new ServerError("Invalid server details provided");
    }
    //destructuring validated fields
    const { name, imageUrl } = validatedFields.data;
    //create server
    const server = await db.server.create({
      data: {
        userId: user.id,
        name,
        imageUrl,
        inviteCode: uuid(),
        channels: {
          create: [{ name: "general", userId: user.id }],
        },
        members: {
          create: [{ userId: user.id, role: MemberRole.ADMIN }],
        },
      },
    });
    if (!server) {
      throw new ServerError("Failed to create server");
    }
    revalidatePath("/");
    return {
      success: true,
      data: server,
    };
  } catch (error) {
    return handleError(error);
  }
};
