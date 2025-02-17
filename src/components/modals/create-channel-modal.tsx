"use client";
/**
 * Create Channel Modal Component
 * Provides an interface for creating new channels within a server.
 * Supports different channel types (TEXT, AUDIO, VIDEO) with form validation
 * and real-time error handling.
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
import { createChannel } from "@/actions/create-channel";
import { useEffect } from "react";
import { ServerError } from "@/lib/errors/app-error";
import { handleError } from "@/lib/errors/handle-error";
import { useToast } from "@/hooks/use-toast";
import { FormError } from "@/components/error/form-error";

export const CreateChannelModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const router = useRouter();
  const { server, channelType } = data;
  const isModalOpen = isOpen && type === "createChannel";
  const { toast } = useToast();
  /**
   * Form Configuration
   * Sets up form validation and handles channel type preselection
   */
  const form = useForm({
    resolver: zodResolver(ChannelSchema),
    defaultValues: {
      name: "",
      type: channelType || ChannelType.TEXT, // Default to TEXT channels
    },
  });
  /**
   * Channel Type Synchronization
   * Ensures form reflects the selected channel type from context
   */
  useEffect(() => {
    if (channelType) {
      form.setValue("type", channelType);
    } else {
      form.setValue("type", ChannelType.TEXT);
    }
  }, [channelType, form]);

  const isLoading = form.formState.isSubmitting;
  /**
   * Channel Creation Handler
   * Manages the creation process including validation and error handling
   */
  const onSubmit = async (values: z.infer<typeof ChannelSchema>) => {
    try {
      // Server validation
      if (!server?.id) {
        throw new ServerError("Server information is missing");
      }
      const result = await createChannel(server.id, values);
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
        description: "Channel created successfully",
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
    form.reset();
    form.clearErrors();
    onClose();
  };
  const formError = form.formState.errors.root?.message;
  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black dark:bg-zinc-900 dark:text-white p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Create Channel
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500 dark:text-zinc-400">
            Create a new channel to organize discussions and content
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
                    <FormLabel className="uppercase text-xs font-bold text-primary ">
                      Channel name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-zinc-300/50 text-black dark:text-white dark:bg-zinc-700/50 border-0 focus-visible:ring-0  focus-visible:ring-offset-0"
                        disabled={isLoading}
                        placeholder="Enter channel name"
                        {...field}
                        autoFocus={false}
                        autoComplete="off"
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
                    <FormLabel className="uppercase text-xs font-bold text-primary">
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
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
