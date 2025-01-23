"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Settings, Lock, Globe } from "lucide-react";
import { MemberRole, Server } from "@prisma/client";
import { useRouter } from "next/navigation";
import type { ServerWithMemberInfo } from "@/types";
import { cn } from "@/lib/utils";

interface UserServersProps {
  servers: ServerWithMemberInfo[];
  userId: string;
}

const ITEMS_PER_PAGE = 9; // Show 9 servers per page (3x3 grid)

export function UserServers({ servers, userId }: UserServersProps) {
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const filteredUserServers = servers.filter((server) =>
    server.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUserServers.length / ITEMS_PER_PAGE);
  const paginatedServers = filteredUserServers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getUserRole = (server: ServerWithMemberInfo) => {
    const member = server.members.find((member) => member.userId === userId);
    return member?.role || MemberRole.GUEST;
  };

  const handleServerClick = (serverId: string) => {
    router.push(`/servers/${serverId}`);
  };

  // Reset to first page when searching
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Input
          type="text"
          placeholder="Search servers..."
          value={userSearchQuery}
          onChange={handleSearch}
          className="mb-2 sm:mb-0"
        />
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          Showing {paginatedServers.length} of {filteredUserServers.length}{" "}
          servers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedServers.map((server) => {
          const userRole = getUserRole(server);

          return (
            <Card
              key={server.id}
              className="group overflow-hidden border transition-all flex flex-col hover:scale-[1.02] shadow-md hover:shadow-xl bg-card"
            >
              <CardHeader className="p-0">
                <div className="relative h-24 bg-gradient-to-br from-violet-600 to-indigo-600">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative p-4 flex justify-between items-start">
                    <Avatar className="h-16 w-16 rounded-full ring-2 ring-white/10">
                      <AvatarImage src={server.imageUrl} alt={server.name} />
                      <AvatarFallback>{server.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Badge
                      className={cn(
                        "px-2.5 py-0.5 text-xs font-semibold text-white",
                        server.isPublic
                          ? "bg-emerald-500/90 hover:bg-emerald-500/90"
                          : "bg-rose-500/90 hover:bg-rose-500/90"
                      )}
                    >
                      {server.isPublic ? (
                        <Globe className="h-3.5 w-3.5 mr-1 inline" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 mr-1 inline" />
                      )}
                      {server.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mt-2 px-4">
                  {server.name}
                </h3>
              </CardHeader>

              <CardContent className="p-4 space-y-3 flex-grow">
                {server.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {server.description}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members:</span>
                    <Badge variant="secondary">
                      <Users className="h-3.5 w-3.5 mr-1 inline" />
                      {server._count.members}
                    </Badge>
                  </div>
                  {server.category && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="secondary">{server.category}</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your Role:</span>
                    <Badge
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold text-white",
                        userRole === MemberRole.ADMIN
                          ? "bg-rose-500/90 hover:bg-rose-500/90"
                          : userRole === MemberRole.MODERATOR
                          ? "bg-indigo-500/90 hover:bg-indigo-500/90"
                          : "bg-emerald-500/90 hover:bg-emerald-500/90"
                      )}
                    >
                      {userRole.toLowerCase()}
                    </Badge>
                  </div>
                </div>

                {server.tags && server.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {server.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4">
                <Button
                  onClick={() => handleServerClick(server.id)}
                  className="w-full bg-gradient-to-br from-violet-600 to-indigo-600 text-primary-foreground transition-all hover:brightness-110 hover:scale-[1.02]"
                >
                  Open Server
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
                className="w-8 h-8"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
