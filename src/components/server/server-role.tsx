import { MemberRole } from "@prisma/client";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServerRoleProps {
  role: MemberRole;
}

export const ServerRole = ({ role }: ServerRoleProps) => {
  // Role-specific icon and tooltip content mapping
  const roleIconMap = {
    [MemberRole.GUEST]: {
      icon: null,
      tooltip: "Member",
    },
    [MemberRole.MODERATOR]: {
      icon: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
      tooltip: "Moderator",
    },
    [MemberRole.ADMIN]: {
      icon: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
      tooltip: "Admin",
    },
  };

  // If the role is GUEST (no icon), return null
  if (role === MemberRole.GUEST) return null;

  const { icon, tooltip } = roleIconMap[role];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center">{icon}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-semibold">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
