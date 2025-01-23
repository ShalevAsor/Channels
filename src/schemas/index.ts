import { ChannelType, UserRole } from "@prisma/client";
import * as z from "zod";

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }
      return true;
    },
    {
      message: "New password is required! ",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (!data.password && data.newPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Password is required!",
      path: ["password"],
    }
  );

export const LoginSchema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password is required"),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(6, "Minimum 6 characters required"),
  name: z.string().min(1, "Name is required"),
});

export const ResetSchema = z.object({
  email: z.string().email("Email is required"),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, "Minimum 6 characters required"),
});

export const ServerFormSchema = z.object({
  name: z
    .string()
    .min(1, "Server name is required")
    .max(100, "Server name cannot exceed 100 characters"),
  imageUrl: z.string().min(1, "Server image is required"),
  isPublic: z.boolean().default(false),
  category: z
    .string()
    .max(50, "Category cannot exceed 50 characters")
    .optional()
    .transform((val) => (val === "" ? undefined : val)), // Handle empty strings
  tags: z
    .array(z.string().max(20, "Tag cannot exceed 20 characters"))
    .max(10, "Maximum of 10 tags allowed")
    .default([]),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .transform((val) => (val === "" ? undefined : val)), // Handle empty strings
});

export const ChannelSchema = z
  .object({
    name: z.string().min(1, "Channel name is required"),
    type: z.nativeEnum(ChannelType),
  })
  .refine(
    (data) => {
      if (data.name === "general") {
        return false;
      }
      return true;
    },
    {
      message: "Channel name cannot be 'general'",
      path: ["name"],
    }
  );

export const ChatInputSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export const MessageFileSchema = z.object({
  fileUrl: z.string().min(1, "Attachment is required"),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
});
