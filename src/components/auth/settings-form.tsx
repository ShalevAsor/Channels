"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { settings } from "@/actions/settings";
import { useTransition, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { FormError } from "@/components/error/form-error";
import { FormSuccess } from "@/components/form-success";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errors/handle-error";

interface SettingsFormProps {
  modal?: boolean;
  onSuccess?: () => void;
  className?: string;
}

export const SettingsForm = ({
  modal,
  onSuccess,
  className,
}: SettingsFormProps) => {
  const user = useCurrentUser();
  const { update } = useSession();
  const { toast } = useToast();
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      password: undefined,
      newPassword: undefined,
      role: user?.role || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
    },
  });
  const onSubmit = async (values: z.infer<typeof SettingsSchema>) => {
    try {
      setSuccess("");
      setIsLoading(true);
      const result = await settings(values);
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
      // Success case
      setSuccess(result.data.message);
      update(); // Update the session
      toast({
        description: result.data.message,
      });
      if (modal && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorResponse = handleError(error);
      toast({
        description: errorResponse.error.message,
        variant: "destructive",
      });
      form.setError("root", {
        message: errorResponse.error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const formError = form.formState.errors.root?.message;
  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {formError && <FormError message={formError} />}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="John Doe"
                      className="bg-zinc-300/50 dark:bg-zinc-700/75 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!user?.isOAuth && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder="john.doe@example.com"
                          type="email"
                          className="bg-zinc-300/50 dark:bg-zinc-700/75 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder="******"
                          type="password"
                          className="bg-zinc-300/50 dark:bg-zinc-700/75 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder="******"
                          type="password"
                          className="bg-zinc-300/50 dark:bg-zinc-700/75 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                    Role
                  </FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-zinc-300/50 dark:bg-zinc-700/75 border-0 focus:ring-0 ring-offset-0 focus:ring-offset-0 capitalize outline-none text-black dark:text-white">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.ADMIN} className="capitalize">
                        Admin
                      </SelectItem>
                      <SelectItem value={UserRole.USER} className="capitalize">
                        User
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!user?.isOAuth && (
              <FormField
                control={form.control}
                name="isTwoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-zinc-200 dark:border-zinc-700">
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                        Two Factor Authentication
                      </FormLabel>
                      <FormDescription className="text-zinc-500 dark:text-zinc-400">
                        Enable two factor authentication for your account
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        disabled={isLoading}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className="mt-4">
            <FormSuccess message={success} />
          </div>
          <Button
            disabled={isLoading}
            type="submit"
            variant="primary"
            className="w-full mt-6"
          >
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};
