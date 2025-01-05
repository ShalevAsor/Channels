import Image from "next/image";
import { Server } from "@prisma/client"; // Assuming you have a Server type defined
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
interface ServerListProps {
  servers: Server[];
}

export const ServerList = ({ servers }: ServerListProps) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="group">
          <a href="/channels/@me" className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
                "bg-zinc-700 group-hover:bg-indigo-500"
              )}
            >
              <Image
                src="/discord-logo.svg"
                alt="Discord"
                width={28}
                height={28}
              />
            </div>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Separator className="my-3 h-[2px] w-10 mx-auto bg-zinc-700" />
      {servers.map((server) => (
        <SidebarMenuItem key={server.id}>
          <SidebarMenuButton asChild className="group relative">
            <a href={`/channels/${server.id}`} className="flex items-center">
              <div
                className={cn(
                  "absolute left-0 bg-white rounded-r-full transition-all w-[4px]",
                  "group-hover:h-[20px] h-[8px] group-hover:opacity-100 opacity-0"
                )}
              />
              <div
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
                  "bg-zinc-700 group-hover:bg-indigo-500"
                )}
              >
                {server.imageUrl ? (
                  <Image
                    src={server.imageUrl}
                    alt={server.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-white">
                    {server.name[0].toUpperCase()}
                  </span>
                )}
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
