"use client";
/**
 * Leave Server Modal Component
 *
 * Provides a confirmation interface for users to leave a server safely.
 * Implements comprehensive error handling and user feedback mechanisms
 * to ensure a smooth departure process while preventing accidental actions.
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
import { leaveServer } from "@/actions/leave-server";
import { useToast } from "@/hooks/use-toast";
import { ServerError } from "@/lib/errors/app-error";
import { handleError } from "@/lib/errors/handle-error";
import { ModalError } from "@/components/error/modal-error";
export const LeaveServerModal = () => {
  const { isOpen, onOpen, onClose, type, data } = useModalStore();
  const router = useRouter();
  const isModalOpen = isOpen && type === "leaveServer";
  const { server } = data;
  /**
   * Local State Management
   * Tracks loading and error states during the leave process
   * to provide immediate feedback and prevent duplicate actions
   */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  /**
   * Server Departure Handler
   * Manages the complete process of leaving a server:
   * 1. Validates server information
   * 2. Attempts to leave the server
   * 3. Handles success/failure scenarios
   * 4. Manages navigation after departure
   */
  const handleLeaveServer = async () => {
    try {
      setIsLoading(true);
      setError("");
      if (!server?.id) {
        throw new ServerError("Server information is missing");
      }
      const result = await leaveServer(server?.id);
      if (!result.success) {
        setError(result.error.message);
        toast({
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        description: "Server left successfully",
      });
      onClose();
      router.push("/");
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
  /**
   * Modal Close Handler
   * Ensures clean state reset when closing the modal
   */
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
            Leave Server
          </DialogTitle>
          <DialogDescription className="text-center dark:text-zinc-400 text-zinc-500">
            Are you sure you want to leave{" "}
            <span className="font-semibold text-indigo-500">
              {server?.name}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>
        {error && <ModalError message={error} />}
        <DialogFooter className="bg-gray-100 dark:bg-zinc-900 px-6 py-4">
          <div className="flex items-center justify-center w-full gap-x-2">
            <Button
              className="hover:bg-zinc-500 dark:hover:bg-zinc-800"
              variant="ghost"
              disabled={isLoading}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={isLoading}
              onClick={handleLeaveServer}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
