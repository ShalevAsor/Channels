import { User } from "@prisma/client"; // Assuming you have a User type defined
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, UserIcon } from "lucide-react";

interface UserSectionProps {
  user: User;
}

export const UserSection = ({ user }: UserSectionProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <button className="flex items-center w-full p-2 rounded-md hover:bg-zinc-700 transition">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-semibold text-white">
              {user.name}
            </span>
            <span className="text-xs text-zinc-400">
              #{user.id.slice(0, 4)}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 text-sm font-medium text-zinc-400 space-y-[2px]">
        <DropdownMenuItem className="px-3 py-2 text-sm cursor-pointer">
          <UserIcon className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="px-3 py-2 text-sm cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="px-3 py-2 text-sm cursor-pointer text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
