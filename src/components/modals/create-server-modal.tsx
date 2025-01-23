"use client";
/**
 * Server Creation Modal
 * Provides an interface for users to create new servers.
 * Handles form state, validation, and server creation through a form-driven interface.
 */
import * as z from "zod";
import { createServer } from "@/actions/create-server";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ServerFormSchema } from "@/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useRouter } from "next/navigation";
import { useModalStore } from "@/stores/use-modal-store";
import { useToast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errors/handle-error";
import { ServerForm } from "../server/server-form";
export const CreateServerModal = () => {
  /**
   * Modal State Management
   * Uses the centralized modal store to control visibility and modal state
   */
  const { isOpen, onClose, type } = useModalStore();
  const router = useRouter();
  const { toast } = useToast();
  // Only show this modal when it's explicitly opened as a "createServer" modal
  const isModalOpen = isOpen && type === "createServer";
  /**
   * Form Configuration
   * Sets up form validation and default values for server creation
   */
  const form = useForm({
    resolver: zodResolver(ServerFormSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      isPublic: false,
      category: "",
      tags: [],
      description: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  /**
   * Form Submission Handler
   * Processes the server creation request and handles success/error states
   */
  const onSubmit = async (values: z.infer<typeof ServerFormSchema>) => {
    try {
      const result = await createServer(values);
      if (!result.success) {
        // Handle creation failure with user feedback

        toast({
          description: result.error.message,
          variant: "destructive",
        });
        form.setError("root", {
          message: result.error.message,
        });
        return;
      }
      // Handle successful creation

      toast({
        description: "Server created successfully",
      });
      form.reset();
      router.refresh();
      onClose();
    } catch (error) {
      const errorResponse = handleError(error);
      toast({
        description: errorResponse.error.message,
        variant: "destructive",
      });
      form.setError("root", {
        message: errorResponse.error.message,
      });
    }
  };
  /**
   * Modal Close Handler
   * Ensures clean form state when modal is closed
   */
  const handleClose = () => {
    form.reset();
    form.clearErrors();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black dark:bg-zinc-900 dark:text-white p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Create your server
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Give your server a personality with a name and an image. You can
            always change it later
          </DialogDescription>
        </DialogHeader>
        <ServerForm
          form={form}
          isLoading={isLoading}
          onSubmit={onSubmit}
          buttonLabel="Create"
        />
      </DialogContent>
    </Dialog>
  );
};
