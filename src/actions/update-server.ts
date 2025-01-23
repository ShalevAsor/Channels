"use server";
import { db } from "@/lib/db";
import * as z from "zod";
import { ServerFormSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import { revalidatePath } from "next/cache";
import { currentUserId } from "@/lib/auth";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import { AuthError, ServerError } from "@/lib/errors/app-error";
import { Server } from "@prisma/client";

export const updateServerSettings = async (
  serverId: string,
  values: z.infer<typeof ServerFormSchema>
): Promise<ActionResponse<Server>> => {
  try {
    const userId = await currentUserId();
    if (!userId) {
      throw new ServerError("You must be logged in to update server settings");
    }
    const user = await getUserById(userId);
    if (!user) throw new AuthError("User not found");

    const validatedFields = ServerFormSchema.safeParse(values);
    if (!validatedFields.success) {
      throw new ServerError("Invalid server data");
    }

    const { name, imageUrl, isPublic, category, tags, description } =
      validatedFields.data;

    const server = await db.server.update({
      where: { id: serverId, userId },
      data: {
        name,
        imageUrl,
        isPublic,
        category,
        tags,
        description,
      },
    });

    if (!server) throw new ServerError("Server not found");
    revalidatePath("/");
    return { success: true, data: server };
  } catch (error) {
    return handleError(error);
  }
};
