"use client";

import { cn } from "@/lib/utils";
import { Member, MemberRole, Server, User } from "@prisma/client";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import UserAvatar from "@/components/user-avatar";
import { useWebSocket } from "../providers/websocket-provider";
import { StatusIndicator } from "./server-status-indicator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ServerRole } from "./server-role";

interface ServerMemberProps {
  member: Member & { user: User };
  server: Server;
}

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

export const ServerMember = ({ member }: ServerMemberProps) => {
  const params = useParams();
  const router = useRouter();
  const { isConnected } = useWebSocket();
  const onClick = () => {
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 rounded-md flex flex-row items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.memberId === member.id && "bg-zinc-700/20 dark:bg-zinc-700"
      )}
    >
      <UserAvatar
        className="h-8 md:h-8 md:w-8"
        src={member.user.image || undefined}
      />
      <div className="w-full flex items-center justify-between">
        <p
          className={cn(
            "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
            params?.memberId === member.id &&
              "text-primary dark:text-zinc-200 dark:group-hover:text-white"
          )}
        >
          {member.user.name}
        </p>
        <div className="flex items-center gap-x-2">
          <ServerRole role={member.role} />
          <TooltipProvider>
            <Tooltip delayDuration={50}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <StatusIndicator isConnected={isConnected} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs font-semibold">
                {isConnected ? "Online" : "Offline"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </button>
  );
};
