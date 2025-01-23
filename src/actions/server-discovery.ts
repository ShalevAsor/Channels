"use server";

import { db } from "@/lib/db";

import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import { ServerError } from "@/lib/errors/app-error";
import { ServerWithMemberCount } from "@/types";
import { Member } from "@prisma/client";
export const getPublicServers = async (): Promise<
  ActionResponse<ServerWithMemberCount[]>
> => {
  try {
    const servers = await db.server.findMany({
      where: {
        isPublic: true,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: servers,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const joinServer = async (
  serverId: string,
  userId: string
): Promise<ActionResponse<Member>> => {
  try {
    const server = await db.server.findUnique({
      where: {
        id: serverId,
      },
    });
    if (!server) {
      throw new ServerError("Server not found");
    }
    // Check if user is already a member
    const existingMember = await db.member.findFirst({
      where: {
        serverId,
        userId,
      },
    });

    if (existingMember) {
      throw new ServerError("User is already a member of this server");
    }

    // Create new member
    const member = await db.member.create({
      data: {
        userId,
        serverId,
        role: "GUEST",
      },
    });

    return {
      success: true,
      data: member,
    };
  } catch (error) {
    return handleError(error);
  }
};
