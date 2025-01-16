"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MessageFileSchema } from "@/schemas";
import { createFileMessage, createMessage } from "@/actions/message";
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
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/stores/use-modal-store";
import { FormError } from "../error/form-error";
import { useToast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errors/handle-error";
import { createDirectFileMessage } from "@/actions/direct-messages";

export const MessageFileModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  // const { apiUrl, query } = data;
  const { serverId, channelId, conversationId } = data;
  const router = useRouter();
  const { toast } = useToast();
  const isModalOpen = isOpen && type === "messageFile";

  const form = useForm({
    resolver: zodResolver(MessageFileSchema),
    defaultValues: {
      fileUrl: "",
      fileType: "",
      fileName: "",
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof MessageFileSchema>) => {
    try {
      if (!serverId) return;
      let result;
      if (channelId) {
        result = await createFileMessage(values, serverId, channelId);
      } else if (conversationId) {
        result = await createDirectFileMessage(
          values,
          serverId,
          conversationId
        );
      } else {
        return;
      }

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

      router.refresh();
      handleClose();
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
  const formError = form.formState.errors.root?.message;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className="bg-white text-black p-0 overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 text-center">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {formError && <FormError message={formError} />}
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {/* <FileUpload
                          endpoint="messageFile"
                          value={field.value}
                          onChange={field.onChange}
                        /> */}
                        <FileUpload
                          endpoint="messageFile"
                          value={field.value}
                          onChange={(url, file) => {
                            field.onChange(url);
                            if (file) {
                              form.setValue("fileName", file.name);
                              form.setValue("fileType", file.type);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant="primary" disabled={isLoading}>
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
