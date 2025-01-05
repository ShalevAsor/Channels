import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/string-utils";
interface UserAvatarProps {
  src?: string;
  className?: string;
  name?: string | null;
}

const UserAvatar = ({ src, className, name }: UserAvatarProps) => {
  return (
    <Avatar className={cn("h-7 w-7 md:h-10 md:w-10", className)}>
      <AvatarImage src={src} alt={name ? `${name}'s avatar` : "User avatar"} />
      <AvatarFallback>{name ? getInitials(name) : "U"}</AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
