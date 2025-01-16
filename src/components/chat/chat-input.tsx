// "use client";

// import { useEffect } from "react";
// import * as z from "zod";
// import { ChatInputSchema } from "@/schemas";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Form, FormControl, FormItem, FormField } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Plus } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { createMessage } from "@/actions/message";
// import { useModalStore } from "@/stores/use-modal-store";
// import { EmojiPicker } from "@/components/emoji-picker";
// import { pusherClient, channelName } from "@/lib/pusher";

// interface ChatInputProps {
//   apiUrl: string;
//   query: Record<string, string>;
//   name: string;
//   type: "conversation" | "channel";
// }

// export const ChatInput = ({ apiUrl, query, name, type }: ChatInputProps) => {
//   const { onOpen } = useModalStore();
//   const router = useRouter();

//   const form = useForm<z.infer<typeof ChatInputSchema>>({
//     resolver: zodResolver(ChatInputSchema),
//     defaultValues: {
//       content: "",
//     },
//   });

//   const isLoading = form.formState.isSubmitting;

//   useEffect(() => {
//     const channelKey = channelName(query.channelId);
//     console.log("Subscribing to channel:", channelKey);

//     if (!pusherClient.channel(channelKey)) {
//       pusherClient.subscribe(channelKey);
//     }

//     return () => {
//       pusherClient.unsubscribe(channelKey);
//     };
//   }, [query.channelId]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     form.setValue("content", e.target.value);
//   };

//   const onSubmit = async (values: z.infer<typeof ChatInputSchema>) => {
//     try {
//       const result = await createMessage(
//         values,
//         query.serverId,
//         query.channelId,
//         query.fileUrl || null
//       );

//       if (!result.success) {
//         console.error("Error creating message:", result.error);
//         return;
//       }

//       form.reset();
//       router.refresh();
//     } catch (error) {
//       console.error("Chat input error:", error);
//     }
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)}>
//         <FormField
//           control={form.control}
//           name="content"
//           render={({ field }) => (
//             <FormItem>
//               <FormControl>
//                 <div className="relative p-4 pb-6">
//                   <button
//                     type="button"
//                     onClick={() => onOpen("messageFile", { apiUrl, query })}
//                     className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 rounded-full p-1 flex items-center justify-center"
//                   >
//                     <Plus className="text-white dark:text-[#313338]" />
//                   </button>
//                   <Input
//                     disabled={isLoading}
//                     className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
//                     placeholder={`Message ${
//                       type === "conversation" ? name : "#" + name
//                     }`}
//                     {...field}
//                     onChange={handleInputChange}
//                   />
//                   <div className="absolute top-7 right-8">
//                     <EmojiPicker
//                       onChange={(emoji: string) => {
//                         field.onChange(field.value + emoji);
//                       }}
//                     />
//                   </div>
//                 </div>
//               </FormControl>
//             </FormItem>
//           )}
//         />
//       </form>
//     </Form>
//   );
// };
"use client";

import { useEffect } from "react";
import * as z from "zod";
import { ChatInputSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createMessage } from "@/actions/message";
import { createDirectMessage } from "@/actions/direct-messages";
import { useModalStore } from "@/stores/use-modal-store";
import { EmojiPicker } from "@/components/emoji-picker";
import { pusherClient, channelName } from "@/lib/pusher";

/**
 * Updated interface for ChatInput that focuses on what's actually needed
 * for message creation and context identification
 */
interface ChatInputProps {
  name: string; // Channel or conversation name
  type: "conversation" | "channel"; // Type of chat
  messageParams: {
    // Parameters needed for message creation
    serverId?: string; // Required for channel messages
    channelId?: string; // Required for channel messages
    conversationId?: string; // Required for direct messages
    memberId?: string; // Required for direct messages
    fileUrl?: string; // Optional file attachment
  };
}

export const ChatInput = ({ name, type, messageParams }: ChatInputProps) => {
  const { onOpen } = useModalStore();
  const router = useRouter();

  // Form setup using react-hook-form with Zod validation
  const form = useForm<z.infer<typeof ChatInputSchema>>({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: {
      content: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Note: We've removed the commented-out useEffect as it's now handled by our
  // PusherProvider and useChatSocket hook

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("content", e.target.value);
  };

  /**
   * Handles message submission for both channel and direct messages
   * Uses different server actions based on the chat type
   */
  const onSubmit = async (values: z.infer<typeof ChatInputSchema>) => {
    try {
      let result;

      if (type === "channel") {
        // Handle channel message creation
        if (!messageParams.serverId || !messageParams.channelId) {
          throw new Error("Missing channel parameters");
        }

        result = await createMessage(
          values,
          messageParams.serverId,
          messageParams.channelId,
          messageParams.fileUrl || null
        );
      } else {
        // Handle direct message creation
        if (!messageParams.conversationId || !messageParams.memberId) {
          throw new Error("Missing conversation parameters");
        }

        result = await createDirectMessage(
          values,
          messageParams.conversationId,
          messageParams.memberId,
          messageParams.fileUrl || null
        );
      }

      if (!result.success) {
        console.error(`Error creating ${type} message:`, result.error);
        return;
      }

      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Chat input error:", error);
    }
  };
  const handleFileUpload = () => {
    let modalData;

    if (type === "channel") {
      modalData = {
        serverId: messageParams.serverId,
        channelId: messageParams.channelId,
      };
    } else {
      modalData = {
        serverId: messageParams.serverId,
        conversationId: messageParams.conversationId,
      };
    }

    onOpen("messageFile", modalData);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative p-4 pb-6">
                  {/* File upload button */}
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 rounded-full p-1 flex items-center justify-center"
                  >
                    <Plus className="text-white dark:text-[#313338]" />
                  </button>

                  {/* Message input field */}
                  <Input
                    disabled={isLoading}
                    className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                    placeholder={`Message ${
                      type === "conversation" ? name : "#" + name
                    }`}
                    {...field}
                    onChange={handleInputChange}
                  />

                  {/* Emoji picker */}
                  <div className="absolute top-7 right-8">
                    <EmojiPicker
                      onChange={(emoji: string) => {
                        field.onChange(field.value + emoji);
                      }}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
