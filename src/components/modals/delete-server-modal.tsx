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
import { deleteServer } from "@/actions/delete-server";
import { useToast } from "@/hooks/use-toast";
import { ServerError } from "@/lib/errors/app-error";
import { handleError } from "@/lib/errors/handle-error";
import { ModalError } from "../error/modal-error";
export const DeleteServerModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const router = useRouter();
  const { toast } = useToast();
  const isModalOpen = isOpen && type === "deleteServer";
  const { server } = data;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteServer = async () => {
    try {
      setError("");
      setIsLoading(true);
      if (!server?.id) {
        throw new ServerError("Server information is missing");
      }
      const result = await deleteServer(server?.id);
      if (!result.success) {
        setError(result.error.message);
        toast({
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        description: "Server deleted successfully",
      });
      onClose();
      router.push("/");
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
  const handleClose = () => {
    setError("");
    setIsLoading(false);
    onClose();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this? <br />
            <span className="font-semibold text-indigo-500">
              {server?.name}{" "}
            </span>
            will be permanently deleted
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="px-6">
            <ModalError message={error} />
          </div>
        )}
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-center w-full gap-x-2">
            <Button variant="secondary" disabled={isLoading} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={isLoading}
              onClick={handleDeleteServer}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
