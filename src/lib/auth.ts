import { auth } from "@/auth";
import { getUserById } from "@/data/user";

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();
  return session?.user.role;
};

export const currentUserId = async () => {
  const session = await auth();
  return session?.user.id;
};

export const getCurrentUser = async () => {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) return null;
  return await getUserById(userId);
};
