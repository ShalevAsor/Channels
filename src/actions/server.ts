"use server";
import { db } from "@/lib/db";
import { AuthError, ServerError } from "@/lib/errors/app-error";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import {
  ServerWithGeneralChannel,
  ServerWithMemberInfo,
  ServerWithMembersAndChannels,
} from "@/types/server";
import {
  validateInviteCode,
  validateServerId,
  validateUserId,
} from "@/utils/validation-utils";
import { Server } from "@prisma/client";

export const getFirstServer = async (
  userId: string
): Promise<ActionResponse<Server | null>> => {
  try {
    validateUserId(userId);

    const server = await db.server.findFirst({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
    return {
      success: true,
      data: server || null,
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Retrieves a specific server by ID, ensuring user has access
 * Used for server navigation and access control
 *
 * @param serverId - The server ID to retrieve
 * @param userId - The authenticated user's ID
 * @returns Promise resolving to the server data
 *
 */

export const getServerByServerAndUserId = async (
  serverId: string,
  userId: string
): Promise<ActionResponse<Server>> => {
  try {
    validateServerId(serverId);

    validateUserId(userId);

    const server = await db.server.findUnique({
      where: {
        id: serverId,
        members: {
          some: {
            userId,
          },
        },
      },
    });
    if (!server) {
      return {
        success: false,
        error: {
          message: "Server not found or access denied",
          code: "SERVER_ERROR",
        },
      };
    }
    return {
      success: true,
      data: server,
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Retrieves a server with its general channel for initial navigation
 * Used when redirecting users to a server's default channel
 *
 * @param serverId - The server ID to retrieve
 * @param userId - The authenticated user's ID
 * @returns Promise resolving to server with general channel
 */

export const getServerWithGeneralChannelByServerAndUserId = async (
  serverId: string,
  userId: string
): Promise<ActionResponse<ServerWithGeneralChannel>> => {
  try {
    validateServerId(serverId);
    validateUserId(userId);
    const server = await db.server.findUnique({
      where: {
        id: serverId,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        channels: {
          where: {
            name: "general",
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    if (!server) {
      throw new ServerError("Server not found or access denied");
    }
    return {
      success: true,
      data: server,
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Retrieves all servers where the user is a member
 * Used for server list display and navigation
 *
 * @param userId - The authenticated user's ID
 * @returns Promise resolving to array of servers
 */

export const getServers = async (
  userId: string
): Promise<ActionResponse<Server[]>> => {
  try {
    validateUserId(userId);
    const servers = await db.server.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
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
 * Retrieves comprehensive server data including all members and channels
 * Used for server management, member lists, and channel organization
 * 
 * @param serverId - The server ID to retrieve
 * @returns Promise resolving to server with full member and channel data

 */

export const getServerById = async (
  serverId: string
): Promise<ActionResponse<ServerWithMembersAndChannels>> => {
  try {
    validateServerId(serverId);

    const server = await db.server.findUnique({
      where: {
        id: serverId,
      },
      include: {
        channels: {
          orderBy: {
            createdAt: "asc",
          },
        },
        members: {
          include: {
            user: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });
    if (!server) {
      throw new ServerError("Server not found");
    }
    return {
      success: true,
      data: server,
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Retrieves servers with member information for dashboard and analytics
 * Includes member count and user's role in each server
 *
 * @param userId - The authenticated user's ID
 * @returns Promise resolving to servers with member info and counts
 */

export const getServersWithMemberInfo = async (
  userId: string
): Promise<ActionResponse<ServerWithMemberInfo[]>> => {
  try {
    const servers = await db.server.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: {
            userId,
          },
          select: {
            id: true,
            role: true,
            userId: true,
          },
        },
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
 * Checks if user is already a member of a server by invite code
 * Used to prevent duplicate joins and handle invite flow
 *
 * @param inviteCode - The server invite code
 * @param userId - The authenticated user's ID
 * @returns Promise resolving to server if user is already a member, null otherwise
 */

export const getServerByInviteCodeAndUserId = async (
  inviteCode: string,
  userId: string
): Promise<ActionResponse<Server | null>> => {
  try {
    validateInviteCode(inviteCode);
    validateUserId(userId);
    const server = await db.server.findFirst({
      where: {
        inviteCode,
        members: {
          some: {
            userId,
          },
        },
      },
    });

    return {
      success: true,
      data: server,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const updateServerMemberByInviteCode = async (
  inviteCode: string,
  userId: string
): Promise<ActionResponse<Server>> => {
  try {
    if (!inviteCode) {
      throw new ServerError("Invite code is required");
    }
    if (!userId) {
      throw new AuthError("User id is required");
    }
    const server = await db.server.update({
      where: {
        inviteCode,
      },
      data: {
        members: {
          create: [{ userId }],
        },
      },
    });
    if (!server) {
      throw new ServerError("Server not found");
    }
    return {
      success: true,
      data: server,
    };
  } catch (error) {
    return handleError(error);
  }
};
