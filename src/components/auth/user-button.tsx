/**
 * Modern User Button Component
 * A comprehensive dropdown menu for user-related actions and information.
 */
"use client";

import { useRef } from "react";
import { useTheme } from "next-themes";
import { logout } from "@/actions/auth/logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Settings, Lock, Key, LogOut, Sun, Moon, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/stores/use-modal-store";

interface UserButtonProps {
  side?: "left" | "right" | "top" | "bottom";
}

export const UserButton = ({ side }: UserButtonProps) => {
  const { onOpen } = useModalStore();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const user = useCurrentUser();

  // Handle closing the dropdown menu
  const handleCloseMenu = () => {
    // Remove focus from the trigger button when closing the menu
    if (triggerRef.current) {
      triggerRef.current.blur();
    }
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu onOpenChange={handleCloseMenu}>
      <DropdownMenuTrigger
        ref={triggerRef}
        className="outline-none focus:outline-none group"
      >
        <Avatar className="h-10 w-10 transition-transform duration-300 group-hover:scale-110">
          <AvatarImage
            src={user?.image || ""}
            alt={user?.name || "User avatar"}
          />
          <AvatarFallback className="bg-sky-500 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side={side} className="w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>

            <div className="flex items-center gap-x-2">
              {(user?.isTwoFactorEnabled || user?.isOAuth) && (
                <span className="text-xs bg-emerald-500/15 text-emerald-500 px-2 py-1 rounded-md">
                  Verified
                </span>
              )}
              {user?.role === "ADMIN" && (
                <span className="text-xs bg-blue-500/15 text-blue-500 px-2 py-1 rounded-md">
                  Admin
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <button
            className="w-full flex items-center text-sm px-2 py-1.5"
            onClick={() => onOpen("settings")}
            role="menuitem"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </DropdownMenuItem>

        {user?.role === "ADMIN" && (
          <DropdownMenuItem onClick={() => router.push("/admin")}>
            <Shield className="h-4 w-4 mr-2" />
            Admin Dashboard
          </DropdownMenuItem>
        )}

        {user?.isTwoFactorEnabled ? (
          <DropdownMenuItem>
            <Lock className="h-4 w-4 mr-2 text-emerald-500" />
            2FA Enabled
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onOpen("settings")}>
            <Key className="h-4 w-4 mr-2 text-destructive dark:text-rose-500" />
            Enable 2FA
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 mr-2" />
          ) : (
            <Moon className="h-4 w-4 mr-2" />
          )}
          Toggle Theme
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive dark:text-rose-500 focus:text-destructive"
          onClick={async () => await logout()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
