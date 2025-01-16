"use server";

import { db } from "@/lib/db";
import { MemberError } from "@/lib/errors/app-error";
import { ActionResponse, handleError } from "@/lib/errors/handle-error";
import { ConversationWithMembers } from "@/types";
export const getOrCreateConversation = async (
  memberOneId: string,
  memberTwoId: string
): Promise<ActionResponse<ConversationWithMembers>> => {
  try {
    if (!memberOneId || !memberTwoId) {
      throw new MemberError("Member IDs are required");
    }
    // First check if both members still exist
    const memberOne = await db.member.findUnique({
      where: { id: memberOneId },
    });

    const memberTwo = await db.member.findUnique({
      where: { id: memberTwoId },
    });

    if (!memberOne || !memberTwo) {
      throw new MemberError("Member not found");
    }
    let conversation =
      (await findConversation(memberOneId, memberTwoId)) ||
      (await findConversation(memberTwoId, memberOneId));
    if (!conversation) {
      conversation = await createConversation(memberOneId, memberTwoId);
    }
    if (!conversation) {
      throw new MemberError("Conversation not found");
    }
    return {
      success: true,
      data: conversation,
    };
  } catch (error) {
    return handleError(error);
  }
};

const findConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    const conversation = await db.conversation.findFirst({
      where: {
        AND: [{ memberOneId }, { memberTwoId }],
      },
      include: {
        memberOne: {
          include: {
            user: true,
          },
        },
        memberTwo: {
          include: {
            user: true,
          },
        },
      },
    });
    return conversation;
  } catch (error) {
    console.error("Error finding conversation", error);
    return null;
  }
};

const createConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    const conversation = await db.conversation.create({
      data: {
        memberOneId,
        memberTwoId,
      },
      include: {
        memberOne: {
          include: {
            user: true,
          },
        },
        memberTwo: {
          include: {
            user: true,
          },
        },
      },
    });
    return conversation;
  } catch (error) {
    console.error("Error in createConversation", error);
    return null;
  }
};
