"use server";
import { db } from "@/lib/db";
import { AuthError, MemberError, ServerError } from "@/lib/errors/app-error";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import { MemberWithUser } from "@/types";
import { Member } from "@prisma/client";

export const getMemberByServerAndUserId = async (
  serverId: string,
  userId: string
): Promise<ActionResponse<Member>> => {
  try {
    if (!serverId) {
      throw new ServerError("Server id is required");
    }
    if (!userId) {
      throw new AuthError("User id is required");
    }
    const member = await db.member.findFirst({
      where: {
        serverId,
        userId,
      },
      include: {
        user: true,
      },
    });
    if (!member) {
      throw new MemberError("Member not found");
    }
    return {
      success: true,
      data: member,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getMemberWithUserByServerAndUserId = async (
  serverId: string,
  userId: string
): Promise<ActionResponse<MemberWithUser>> => {
  try {
    if (!serverId) {
      throw new ServerError("Server id is required");
    }
    if (!userId) {
      throw new AuthError("User id is required");
    }
    const member = await db.member.findFirst({
      where: {
        serverId,
        userId,
      },
      include: {
        user: true,
      },
    });
    if (!member) {
      throw new MemberError("Member not found");
    }
    return {
      success: true,
      data: member,
    };
  } catch (error) {
    return handleError(error);
  }
};
