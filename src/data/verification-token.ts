/**
 * @fileoverview Service module for handling verification token operations
 * This module provides functions to retrieve verification tokens from the database
 * by either token value or email address.
 */

import { db } from "@/lib/db";

/**
 * Retrieves a verification token from the database by its token value
 *
 * @param token - The verification token string to search for
 * @returns The verification token record if found, null otherwise
 */
export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });
    return verificationToken;
  } catch {
    return null;
  }
};

/**
 * Retrieves a verification token from the database by email address
 *
 * @param  email - The email address associated with the verification token
 * @returns The first matching verification token record if found, null otherwise
 *
 * @remarks
 * - This function returns the first matching token if multiple exist for the same email
 * - Returns null if no token is found or if an error occurs during the database query
 */
export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { email },
    });
    return verificationToken;
  } catch {
    return null;
  }
};
