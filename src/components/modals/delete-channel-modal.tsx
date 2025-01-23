"use client";
/**
 * Delete Channel Modal Component
 *
 * Provides a confirmation interface for channel deletion with comprehensive
 * error handling and user feedback. This modal implements safety measures
 * to prevent accidental channel deletions while maintaining a smooth user
 * experience.
 */
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
import { deleteChannel } from "@/actions/delete-channel";
import { ChannelError, ServerError } from "@/lib/errors/app-error";
import { useToast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errors/handle-error";
import { ModalError } from "../error/modal-error";
export const DeleteChannelModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const router = useRouter();
  const isModalOpen = isOpen && type === "deleteChannel";
  const { server, channel } = data;
  /**
   * Local State Management
   * Tracks loading state and error messages during the deletion process.
   * This helps provide immediate feedback to users and prevents multiple
   * deletion attempts.
   */
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState("");
  /**
   * Channel Deletion Handler
   * Manages the complete lifecycle of a channel deletion request:
   * 1. Validates required data
   * 2. Attempts deletion
   * 3. Handles success/failure scenarios
   * 4. Manages user navigation
   */
  const handleDeleteChannel = async () => {
    try {
      setError("");
      if (!server?.id) {
        throw new ServerError("Server ID is missing");
      }
      if (!channel?.id) {
        throw new ChannelError("Channel ID is missing");
      }
      const result = await deleteChannel(server?.id, channel.id);
      if (!result.success) {
        setError(result.error.message);
        toast({
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        description: "Channel deleted successfully",
      });
      onClose();
      router.refresh();
      router.push(`/servers/${server.id}`);
    } catch (error) {
      const errorResponse = handleError(error);
      toast({
        description: errorResponse.error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black dark:bg-zinc-900 dark:text-white p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500 dark:text-zinc-400">
            Are you sure you want to do this? <br />
            <span className="font-semibold text-indigo-500">
              #{channel?.name}{" "}
            </span>
            will be permanently deleted
          </DialogDescription>
        </DialogHeader>
        {error && <ModalError message={error} />}
        <DialogFooter className="bg-gray-100 dark:bg-zinc-900 px-6 py-4">
          <div className="flex items-center justify-center w-full gap-x-2">
            <Button variant="secondary" disabled={isLoading} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={isLoading}
              onClick={handleDeleteChannel}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
