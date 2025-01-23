"use client";
/**
 * Edit Server Modal
 * Provides an interface for server administrators to modify server settings.
 * Handles form state management, data persistence, and server updates.
 */
import * as z from "zod";
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
import { useEffect } from "react";
import { updateServerSettings } from "@/actions/update-server";
import { ServerError } from "@/lib/errors/app-error";
import { useToast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errors/handle-error";
import { ServerForm } from "../server/server-form";
export const EditServerModal = () => {
  // Access modal state and server data from the store
  const { isOpen, onClose, type, data } = useModalStore();
  const router = useRouter();
  const { toast } = useToast();
  const isModalOpen = isOpen && type === "editServer";
  const { server } = data;
  /**
   * Form Configuration
   * Initializes form with Zod validation and empty default values
   * Values are populated with server data when available
   */
  const form = useForm<z.infer<typeof ServerFormSchema>>({
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
  /**
   * Server Data Population
   * Populates form fields with existing server data when modal opens
   * Ensures form reflects current server settings
   */
  useEffect(() => {
    if (server) {
      form.setValue("name", server.name);
      form.setValue("imageUrl", server.imageUrl);
      form.setValue("isPublic", server.isPublic);
      form.setValue("category", server.category || "");
      form.setValue("tags", server.tags);
      form.setValue("description", server.description || "");
    }
  }, [server, form]);

  const isLoading = form.formState.isSubmitting;
  /**
   * Form Submission Handler
   * Processes server update request and handles success/error states
   */
  const onSubmit = async (values: z.infer<typeof ServerFormSchema>) => {
    try {
      if (!server?.id) {
        throw new ServerError("Server id is required");
      }
      const result = await updateServerSettings(server.id, values);
      if (!result.success) {
        toast({
          description: result.error.message,
          variant: "destructive",
        });
        form.setError("root", {
          message: result.error.message,
        });
        return;
      }
      toast({
        description: "Server updated successfully",
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

  const handleClose = () => {
    form.clearErrors();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black dark:bg-zinc-900 dark:text-white p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit your server
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Update your server&apos;s settings and information
          </DialogDescription>
        </DialogHeader>
        <ServerForm
          form={form}
          isLoading={isLoading}
          onSubmit={onSubmit}
          buttonLabel="Save"
        />
      </DialogContent>
    </Dialog>
  );
};
