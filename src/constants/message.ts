import { MemberRole } from "@prisma/client";

/**
 * Number of messages to fetch per batch for pagination
 * Optimized for performance while providing good UX
 */
export const MESSAGES_BATCH = 10;

/**
 * Default role assigned to new members joining via invite
 */
export const DEFAULT_MEMBER_ROLE = MemberRole.GUEST;
