import { Server, MemberRole, Channel, Member, User } from "@prisma/client";

export type ServerWithMemberInfo = Server & {
  members: {
    id: string;
    role: MemberRole;
    userId: string;
  }[];
  _count: {
    members: number;
  };
};
export type ServerWithGeneralChannel = Server & {
  channels: Channel[];
};

export type ServerWithMembersAndChannels = Server & {
  channels: Channel[];
  members: (Member & {
    user: User;
  })[];
};

export type ServerWithMemberCount = Server & {
  _count: {
    members: number;
  };
};
