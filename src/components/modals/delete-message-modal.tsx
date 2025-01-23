"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/stores/use-modal-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMessage } from "@/actions/message";
import { deleteDirectMessage } from "@/actions/direct-messages";
import { handleError } from "@/lib/errors/handle-error";
import { useToast } from "@/hooks/use-toast";
import { ModalError } from "../error/modal-error";

export const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const router = useRouter();

  const { messageId, conversationId, serverId, channelId } = data;

  const isModalOpen = isOpen && type === "deleteMessage";
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleDeleteMessage = async () => {
    try {
      setIsLoading(true);
      setError("");
      if (!messageId) throw new Error("Message ID is required");
      if (!serverId) throw new Error("Server ID is required");
      let response;
      if (conversationId) {
        response = await deleteDirectMessage(messageId, conversationId);
      } else {
        if (!channelId) throw new Error("Channel ID is required");
        response = await deleteMessage(messageId, serverId, channelId);
      }
      if (!response.success) {
        setError(response.error.message);
        toast({
          description: response.error.message,
          variant: "destructive",
        });
        return;
      }
      onClose();
      router.refresh();
    } catch (error) {
      const errorResponse = handleError(error);
      setError(errorResponse.error.message);
      toast({
        description: errorResponse.error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="bg-white text-black p-0 overflow-hidden"
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete this message? <br />
            The message will be deleted and cannot be recovered.
          </DialogDescription>
        </DialogHeader>
        {error && <ModalError message={error} />}
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-center w-full gap-x-2">
            <Button variant="secondary" disabled={isLoading} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={isLoading}
              onClick={handleDeleteMessage}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
