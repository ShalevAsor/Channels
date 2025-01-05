"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/stores/use-modal-store";
import { ServerWithMembersWithUsers } from "@/types";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserAvatar from "@/components/user-avatar";
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldCheckIcon,
  ShieldQuestion,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberRole } from "@prisma/client";
import { set } from "zod";
import { updateMemberRole } from "@/actions/update-member-role";
import { kickMemberFromServer } from "@/actions/kick-member";

export const MembersModal = () => {
  const { isOpen, onOpen, onClose, type, data } = useModalStore();
  const isModalOpen = isOpen && type === "members";
  const { server } = data as { server: ServerWithMembersWithUsers };
  const [loadingId, setLoadingId] = useState("");
  const roleIconMap = {
    GUEST: null,
    MODERATOR: <ShieldCheckIcon className="w-4 h-4 text-indigo-500" />,
    ADMIN: <ShieldAlert className="w-4 h-4 text-rose-500" />,
  };

  const handleRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);
      const updatedServer = await updateMemberRole(server.id, memberId, role);
      if (!updatedServer) {
        // You might want to use a toast notification here
        throw new Error("Failed to update member role");
      }
      onOpen("members", { server: updatedServer });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  const handleUserKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);
      const updatedServer = await kickMemberFromServer(server.id, memberId);
      if (!updatedServer) {
        throw new Error("Failed to kick member from server");
      }
      onOpen("members", { server: updatedServer });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-white text-black  overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {server?.members.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 mx-h-[420px] pr-6">
          {server?.members.map((member) => (
            <div key={member.id} className="flex items-center gap-x-2 mb-6">
              <UserAvatar
                src={member.user.image || undefined}
                name={member.user.name}
              />
              <div className="flex flex-col gap-y-1">
                <div className="text-xs font-semibold flex items-center gap-x-1">
                  {member.user.name}
                  {roleIconMap[member.role]}
                </div>
                <p className="text-xs text-zinc-500">{member.user.email}</p>
              </div>
              {server.userId !== member.userId && loadingId !== member.id && (
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="w-4 h-4 text-zinc-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center">
                          <ShieldQuestion className="w-4 h-4 mr-2" />
                          <span>Role</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(member.id, "GUEST")
                              }
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Guest
                              {member.role === "GUEST" && (
                                <Check className="w-4 h-4 ml-auto" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(member.id, "MODERATOR")
                              }
                            >
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Moderator
                              {member.role === "MODERATOR" && (
                                <Check className="w-4 h-4 ml-auto" />
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleUserKick(member.id)}
                      >
                        <Gavel className="h-4 w-4 mr-2" />
                        Kick
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {loadingId === member.id && (
                <Loader2 className="animate-spin text-zinc-500 ml-auto  w-4 h-4" />
              )}
            </div>
          ))}
        </ScrollArea>
        hello members
      </DialogContent>
    </Dialog>
  );
};
