import { Member, Message, User, DirectMessage, Server } from "@prisma/client";

export type MessageWithMember = (Message | DirectMessage) & {
  member: Member;
};

export type MessageWithMemberWithUser = Message & {
  member: Member & {
    user: User;
  };
};

export type DirectMessageWithMemberWithUser = DirectMessage & {
  member: Member & {
    user: User;
  };
};

export type PaginatedMessages = {
  items: MessageWithMemberWithUser[];
  nextCursor: string | undefined;
};
export type DirectMessageWithMemberDetails = DirectMessage & {
  member: Member & {
    user: User;
    server: Server;
  };
};

// Define type for paginated response
export type PaginatedDirectMessages = {
  items: DirectMessageWithMemberDetails[];
  nextCursor: string | undefined;
};
