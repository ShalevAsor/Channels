import { AuthError, MessageError, ServerError } from "@/lib/errors/app-error";
import { ChatInputSchema, MessageFileSchema } from "@/schemas";
import { z } from "zod";

/**
 * Validates that a user ID is provided
 * @param userId - The user ID to validate
 */
export const validateUserId = (userId: string | null | undefined): void => {
  if (!userId) {
    throw new AuthError("User authentication required");
  }
};

/**
 * Validates that a server ID is provided
 * @param serverId - The server ID to validate
 */
export const validateServerId = (serverId: string | null | undefined): void => {
  if (!serverId) {
    throw new ServerError("Server ID is required");
  }
};

/**
 * Validates that an invite code is provided
 * @param inviteCode - The invite code to validate
 */
export const validateInviteCode = (
  inviteCode: string | null | undefined
): void => {
  if (!inviteCode) {
    throw new ServerError("Invite code is required");
  }
};

/**
 * Validates that required message parameters are provided
 * @param serverId - Server ID (required for channel messages)
 * @param channelId - Channel ID (required for channel messages)
 */
export const validateMessageParams = (
  serverId?: string,
  channelId?: string
): void => {
  if (!serverId || !channelId) {
    throw new ServerError("Server ID and channel ID are required");
  }
};

/**
 * Validates message content using schema validation
 * @param values - Message content to validate
 * @returns Validated message data
 */
export const validateMessageContent = (
  values: z.infer<typeof ChatInputSchema>
) => {
  const validatedFields = ChatInputSchema.safeParse(values);
  if (!validatedFields.success) {
    throw new MessageError("Invalid message content");
  }
  return validatedFields.data;
};

/**
 * Validates file message content using schema validation
 * @param values - File message data to validate
 * @returns Validated file message data
 */
export const validateFileMessageContent = (
  values: z.infer<typeof MessageFileSchema>
) => {
  const validatedFields = MessageFileSchema.safeParse(values);
  if (!validatedFields.success) {
    throw new MessageError("Invalid file message content");
  }
  return validatedFields.data;
};

/**
 * Validates that a user is authenticated
 * @param userId - User ID to validate
 */
export const validateAuth = (userId: string | null | undefined): void => {
  if (!userId) {
    throw new AuthError("Authentication required");
  }
};
