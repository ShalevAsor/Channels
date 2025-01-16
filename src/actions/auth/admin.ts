/**
 * Admin Authorization Server Action
 * Demonstrates role-based access control (RBAC) implementation.
 * Protects admin routes by verifying the user's role.
 */
"use server";

import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export const admin = async () => {
  const role = await currentRole();
  if (role !== UserRole.ADMIN) {
    return { error: "Forbidden!" };
  } else {
    return { success: "Allowed!" };
  }
};
