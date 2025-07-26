"use server";

import { db } from "@/lib/db";

import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import { ServerError } from "@/lib/errors/app-error";
import { ServerWithMemberCount } from "@/types/server";
import { Member } from "@prisma/client";

/**
 * Retrieves all public servers available for discovery
 * Returns servers marked as public with their member counts for display
 * Used in server discovery/browse functionality
 *
 * @returns Promise resolving to array of public servers with member counts
 */

export const getPublicServers = async (): Promise<
  ActionResponse<ServerWithMemberCount[]>
> => {
  try {
    // Fetch all public servers with member counts
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

/**
 * Adds a user as a member to a public server
 * Performs validation to ensure server exists and user isn't already a member
 * Creates a new member record with GUEST role by default
 *
 * @param serverId - The ID of the server to join
 * @param userId - The ID of the user joining the server
 * @returns Promise resolving to the created member record
 */

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
