"use server";
import { db } from "@/lib/db";
import { AuthError, ServerError } from "@/lib/errors/app-error";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import { ServerWithMemberInfo } from "@/types";
import { Channel, Member, Server, User } from "@prisma/client";
export const getFirstServer = async (
  userId: string
): Promise<ActionResponse<Server | null>> => {
  try {
    if (!userId) {
      throw new AuthError("User id is required");
    }
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

export const getServerByServerAndUserId = async (
  serverId: string,
  userId: string
): Promise<ActionResponse<Server>> => {
  try {
    if (!serverId) {
      throw new ServerError("Server id is required");
    }
    if (!userId) {
      throw new AuthError("User id is required");
    }
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
type ServerWithGeneralChannel = Server & {
  channels: Channel[];
};
export const getServerWithGeneralChannelByServerAndUserId = async (
  serverId: string,
  userId: string
): Promise<ActionResponse<ServerWithGeneralChannel>> => {
  try {
    if (!serverId) {
      throw new ServerError("Server id is required");
    }
    if (!userId) {
      throw new AuthError("User id is required");
    }
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

export const getServers = async (
  userId: string
): Promise<ActionResponse<Server[]>> => {
  try {
    if (!userId) {
      throw new AuthError("User id is required");
    }
    const servers = await db.server.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
    if (!servers) {
      throw new ServerError("Servers not found");
    }
    return {
      success: true,
      data: servers,
    };
  } catch (error) {
    return handleError(error);
  }
};
type ServerWithMembersAndChannels = Server & {
  channels: Channel[];
  members: (Member & {
    user: User;
  })[];
};
export const getServerById = async (
  serverId: string
): Promise<ActionResponse<ServerWithMembersAndChannels>> => {
  try {
    if (!serverId) {
      throw new ServerError("Server id is required");
    }
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

export const getServerByInviteCodeAndUserId = async (
  inviteCode: string,
  userId: string
): Promise<ActionResponse<Server | null>> => {
  try {
    if (!inviteCode) {
      throw new ServerError("Invite code is required");
    }
    if (!userId) {
      throw new AuthError("User id is required");
    }
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

//

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
