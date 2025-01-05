"use server";
import { db } from "@/lib/db";
import { v4 as uuid } from "uuid";
import * as z from "zod";
import { InitialFormSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import { MemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { currentUserId } from "@/lib/auth";
export const createServer = async (
  values: z.infer<typeof InitialFormSchema>
) => {
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Unauthorized" };
    const user = await getUserById(userId);
    if (!user) return { error: "Unauthorized" };
    //validate fields
    const validatedFields = InitialFormSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };
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
    revalidatePath("/");
    return { success: true, server };
  } catch (error) {
    console.log("Error in createServer", error);
    return { error: "Internal Error" };
  }
};
