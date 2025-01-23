import * as z from "zod";
import { ServerFormSchema } from "@/schemas";
import {
  Form,
  FormControl,
  FormMessage,
  FormField,
  FormLabel,
  FormItem,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/error/form-error";
import { DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

interface ServerFormProps {
  form: any;
  isLoading: boolean;
  onSubmit: (values: z.infer<typeof ServerFormSchema>) => void;
  buttonLabel: string;
}

export const ServerForm = ({
  form,
  isLoading,
  onSubmit,
  buttonLabel,
}: ServerFormProps) => {
  const [newTag, setNewTag] = useState("");
  const tags = form.watch("tags") || [];

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (tags.length >= 10) {
        form.setError("tags", { message: "Maximum of 10 tags allowed" });
        return;
      }
      if (newTag.length > 20) {
        form.setError("tags", { message: "Tag cannot exceed 20 characters" });
        return;
      }
      form.setValue("tags", [...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      tags.filter((tag: string) => tag !== tagToRemove)
    );
  };

  const formError = form.formState.errors.root?.message;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 overflow-y-auto max-h-[calc(90vh-130px)]"
      >
        {formError && <FormError message={formError} />}
        <div className="space-y-8 px-6">
          <div className="flex items-center justify-center">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      endpoint="serverImage"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-primary dark:text-primary/70">
                  Server name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 dark:text-white dark:bg-zinc-700/50"
                    disabled={isLoading}
                    placeholder="Enter server name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-primary dark:text-primary/70">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 dark:text-white dark:bg-zinc-700/50 resize-none"
                    disabled={isLoading}
                    placeholder="Describe your server"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-zinc-500">
                  Describe what your server is about (max 500 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-primary dark:text-primary/70">
                  Category
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 dark:text-white dark:bg-zinc-700/50"
                    disabled={isLoading}
                    placeholder="Server category"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-zinc-500">
                  Choose a category that best describes your server
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={() => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-primary dark:text-primary/70">
                  Tags
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 dark:text-white dark:bg-zinc-700/50"
                    disabled={isLoading}
                    placeholder="Press enter to add tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </FormControl>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <FormDescription className="text-xs text-zinc-500">
                  Add up to 10 tags (max 20 characters each)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium">
                    Public Server
                  </FormLabel>
                  <FormDescription>
                    Make this server discoverable in Server Discovery
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="bg-gray-100 dark:bg-zinc-900 px-6 py-4">
          <Button variant="primary" disabled={isLoading}>
            {buttonLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
