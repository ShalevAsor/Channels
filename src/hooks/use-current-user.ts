/**
 * Current User Hook
 * A custom hook that provides access to the authenticated user's information
 * throughout the application. This hook acts as a centralized way to access
 * user data in client components.
 */
import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const session = useSession();
  return session.data?.user;
};
