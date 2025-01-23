"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useModalStore } from "@/stores/use-modal-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import { useState } from "react";
import { generateNewInviteCode } from "@/actions/generate-invite-code";
import { useToast } from "@/hooks/use-toast";
import { ServerError } from "@/lib/errors/app-error";
import { handleError } from "@/lib/errors/handle-error";
import { ModalError } from "../error/modal-error";
export const InviteModal = () => {
  const { isOpen, onOpen, onClose, type, data } = useModalStore();
  const origin = useOrigin();
  const isModalOpen = isOpen && type === "invite";
  const { server } = data;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const onNew = async () => {
    try {
      setIsLoading(true);
      if (!server?.id) throw new ServerError("Server ID is required");

      const result = await generateNewInviteCode(server.id);
      if (!result.success) {
        setError(result.error.message);
        toast({
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }
      const updatedServer = result.data;
      if (updatedServer) {
        onOpen("invite", {
          server: {
            ...server, // Keep all existing server data
            inviteCode: updatedServer.inviteCode, // Only update the invite code
          },
        });
        toast({
          description: "Invite code generated successfully",
        });
      }
    } catch (error) {
      const errorResponse = handleError(error);
      toast({
        description: errorResponse.error.message,
        variant: "destructive",
      });
      setError(errorResponse.error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setIsLoading(false);
    onClose();
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black dark:bg-zinc-900 dark:text-white p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Invite Friends
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500 dark:text-zinc-400">
            Share the invite link with others to grant access to this server
          </DialogDescription>
        </DialogHeader>
        {error && <ModalError message={error} />}
        <div className="p-6">
          <Label className="uppercase text-xs font-bold text-primary">
            Server invite link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={isLoading}
              className="bg-zinc-300/50 text-black dark:text-white dark:bg-zinc-700/50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={inviteUrl}
              readOnly
            />
            <Button disabled={isLoading} onClick={onCopy} size="icon">
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            onClick={onNew}
            disabled={isLoading}
            variant="link"
            size="sm"
            className="text-xs text-primary mt-4"
          >
            Generate a new link
            <RefreshCw className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
