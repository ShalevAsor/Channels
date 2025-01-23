// components/chat/typing-indicator.tsx
"use client";

import React from "react";
import { MoonLoader } from "react-spinners";

interface TypingUser {
  userId: string;
  username: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserId: string;
}

export const TypingIndicator = ({
  typingUsers,
  currentUserId,
}: TypingIndicatorProps) => {
  // Filter out current user and get relevant typing users
  const relevantTypingUsers = typingUsers.filter(
    (user) => user.userId !== currentUserId
  );

  if (relevantTypingUsers.length === 0) return null;

  const getTypingText = () => {
    if (relevantTypingUsers.length === 1) {
      return `${relevantTypingUsers[0].username} is typing`;
    } else if (relevantTypingUsers.length === 2) {
      return `${relevantTypingUsers[0].username} and ${relevantTypingUsers[1].username} are typing`;
    } else if (relevantTypingUsers.length === 3) {
      return `${relevantTypingUsers[0].username}, ${relevantTypingUsers[1].username}, and ${relevantTypingUsers[2].username} are typing`;
    } else {
      return "Several people are typing";
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
      <MoonLoader size={12} color="currentColor" />
      <span>{getTypingText()}...</span>
    </div>
  );
};
