import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getFirstServer = async (userId: string) => {
  try {
    const server = await db.server.findFirst({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
    return server;
  } catch (error) {
    console.error("Error in getFirstServer", error);
    return null;
  }
};

export const getServerByServerAndUserId = async (
  serverId: string,
  userId: string
) => {
  try {
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
    return server;
  } catch (error) {
    console.log("Error in getServerById", error);
    return null;
  }
};

export const getServers = async (userId: string) => {
  try {
    const servers = await db.server.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
    return servers;
  } catch (error) {
    console.error("Error in getServers", error);
    return null;
  }
};

export const getServerById = async (serverId: string) => {
  try {
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
    return server;
  } catch (error) {
    console.log("Error in getServerById", error);
    return null;
  }
};

export const getServerByInviteCodeAndUserId = async (
  inviteCode: string,
  userId: string
) => {
  try {
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
    return server;
  } catch (error) {
    console.log("Error in getServerByInviteCodeAndUserId", error);
    return null;
  }
};

export const updateServerMemberByInviteCode = async (
  inviteCode: string,
  userId: string
) => {
  try {
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
    return server;
  } catch (error) {
    console.log("Error in updateServerMemberByInviteCode", error);
    return null;
  }
};
