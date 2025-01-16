// import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
// import * as z from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { ChatInputSchema } from "@/schemas";
// import { useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { editMessage } from "@/actions/message";
// import { useRouter } from "next/navigation";
// interface ChatEditMessageProps {
//   content: string;
//   setIsEditing: (editing: boolean) => void;
//   serverId: string;
//   channelId: string;
//   messageId: string;
// }

// export const ChatEditMessage = ({
//   content,
//   setIsEditing,
//   serverId,
//   channelId,
//   messageId,
// }: ChatEditMessageProps) => {
//   const router = useRouter();
//   const form = useForm<z.infer<typeof ChatInputSchema>>({
//     resolver: zodResolver(ChatInputSchema),
//     defaultValues: {
//       content: content,
//     },
//   });
//   const isLoading = form.formState.isSubmitting;
//   useEffect(() => {
//     form.reset({
//       content: content,
//     });
//   }, [content]);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape" || e.keyCode === 27) {
//         setIsEditing(false);
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);
//   const onSubmit = async (values: z.infer<typeof ChatInputSchema>) => {
//     try {
//       const result = await editMessage(values, messageId, serverId, channelId);

//       if (!result.success) {
//         return console.log(result.error);
//       }
//       form.reset();
//       setIsEditing(false);
//       router.refresh();
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="flex items-center w-full pt-2 gap-x-2"
//       >
//         <FormField
//           control={form.control}
//           name="content"
//           render={({ field }) => (
//             <FormItem className="flex-1">
//               <FormControl>
//                 <div className="relative w-full">
//                   <Input
//                     disabled={isLoading}
//                     className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
//                     placeholder="Message..."
//                     {...field}
//                   />
//                 </div>
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <div className="flex flex-row gap-x-1">
//           <Button
//             size="sm"
//             variant="primary"
//             disabled={isLoading}
//             type="submit"
//           >
//             Save
//           </Button>
//           <Button
//             onClick={() => setIsEditing(false)}
//             size="sm"
//             variant="secondary"
//             disabled={isLoading}
//             type="button"
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>
//       <span className="text-[10px] mt-1 text-zinc-400">
//         Press escape to cancel, enter to save
//       </span>
//     </Form>
//   );
// };
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChatInputSchema } from "@/schemas";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { editMessage } from "@/actions/message";
import { updateDirectMessage } from "@/actions/direct-messages";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ChatEditMessageProps {
  content: string;
  setIsEditing: (editing: boolean) => void;
  messageId: string;
  type: "channel" | "conversation";
  serverId?: string;
  channelId?: string;
  conversationId?: string;
}

export const ChatEditMessage = ({
  content,
  setIsEditing,
  messageId,
  type,
  serverId,
  channelId,
  conversationId,
}: ChatEditMessageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof ChatInputSchema>>({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: {
      content: content,
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    form.reset({
      content: content,
    });
  }, [content]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const onSubmit = async (values: z.infer<typeof ChatInputSchema>) => {
    try {
      let result;

      if (type === "channel" && serverId && channelId) {
        console.log("Updating channel message");
        result = await editMessage(values, messageId, serverId, channelId);
      } else if (type === "conversation" && conversationId) {
        console.log("Updating direct message");
        result = await updateDirectMessage(messageId, values, conversationId);
      } else {
        throw new Error("Missing required parameters");
      }

      if (!result.success) {
        toast({
          description: "Failed to edit message",
          variant: "destructive",
        });
        return;
      }

      form.reset();
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center w-full pt-2 gap-x-2"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <div className="relative w-full">
                  <Input
                    disabled={isLoading}
                    className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                    placeholder="Message..."
                    {...field}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex flex-row gap-x-1">
          <Button
            size="sm"
            variant="primary"
            disabled={isLoading}
            type="submit"
          >
            Save
          </Button>
          <Button
            onClick={() => setIsEditing(false)}
            size="sm"
            variant="secondary"
            disabled={isLoading}
            type="button"
          >
            Cancel
          </Button>
        </div>
      </form>
      <span className="text-[10px] mt-1 text-zinc-400">
        Press escape to cancel, enter to save
      </span>
    </Form>
  );
};
