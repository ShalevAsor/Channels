"use client";
/**
 * Edit Channel Modal Component
 * Provides an interface for modifying existing channel settings within a server.
 * Handles form state, data validation, and channel updates with error management.
 */
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChannelSchema } from "@/schemas";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormMessage,
  FormField,
  FormLabel,
  FormItem,
} from "@/components/ui/form";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/stores/use-modal-store";
import { ChannelType } from "@prisma/client";
import { useEffect } from "react";
import { updateChannel } from "@/actions/update-channel";
import { useToast } from "@/hooks/use-toast";
import { ChannelError, ServerError } from "@/lib/errors/app-error";
import { handleError } from "@/lib/errors/handle-error";
import { FormError } from "@/components/error/form-error";
export const EditChannelModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const router = useRouter();
  const { server, channel } = data;
  const isModalOpen = isOpen && type === "editChannel";
  const { toast } = useToast();
  /**
   * Form Configuration with Zod Validation
   * Initializes form with current channel settings as defaults
   */
  const form = useForm({
    resolver: zodResolver(ChannelSchema),
    defaultValues: {
      name: "",
      type: channel?.type || ChannelType.TEXT,
    },
  });
  /**
   * Channel Data Population Effect
   * Updates form values when channel data becomes available
   */
  useEffect(() => {
    if (channel) {
      form.setValue("name", channel.name);
      form.setValue("type", channel.type);
    }
  }, [form, channel]);

  const isLoading = form.formState.isSubmitting;
  /**
   * Channel Update Handler
   * Processes the update request with comprehensive error handling
   */
  const onSubmit = async (values: z.infer<typeof ChannelSchema>) => {
    try {
      if (!server?.id) {
        throw new ServerError("Server id is required");
      }
      if (!channel?.id) {
        throw new ChannelError("Channel id is required");
      }
      const result = await updateChannel(server?.id, channel?.id, values);
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
        description: "Channel updated successfully",
      });
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
  const formError = form.formState.errors.root?.message;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black dark:bg-zinc-900 dark:text-white p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit Channel
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Update your channel information
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {formError && <FormError message={formError} />}
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-primary dark:text-primary/70">
                      Channel name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-zinc-300/50 dark:text-white dark:bg-zinc-700/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        disabled={isLoading}
                        placeholder="Enter channel name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-primary dark:text-primary/70">
                      Channel Type
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 dark:text-white dark:bg-zinc-700/50 border-0 focus:ring-0 text-black focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select a channel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:text-white dark:bg-zinc-700">
                        {Object.values(ChannelType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 dark:bg-zinc-900 px-6 py-4">
              <Button variant="primary" disabled={isLoading}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
