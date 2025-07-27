"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, ChevronDown, ChevronUp, Users, Tag, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { joinServer } from "@/actions/server-discovery";
import { useRouter } from "next/navigation";
import { ServerWithMemberCount } from "@/types/server";

interface PublicServersProps {
  userId: string;
  servers: ServerWithMemberCount[];
}

const ITEMS_PER_PAGE = 10;

export function PublicServers({ servers, userId }: PublicServersProps) {
  const [publicSearchQuery, setPublicSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTag, setSearchTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedServer, setExpandedServer] = useState<string | null>(null);
  const [joiningServer, setJoiningServer] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Get unique categories
  const categories = Array.from(
    new Set(servers.map((server) => server.category || "Uncategorized"))
  );

  // Get tag counts
  const tagCounts = servers.reduce((acc, server) => {
    (server.tags || []).forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Sort tags by frequency
  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([tag]) => tag);

  // Filter tags based on search
  const filteredTags = sortedTags.filter((tag) =>
    tag.toLowerCase().includes(searchTag.toLowerCase())
  );

  // Enhanced filtering
  const filteredPublicServers = servers.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) ||
      server.description
        ?.toLowerCase()
        .includes(publicSearchQuery.toLowerCase()) ||
      (server.category?.toLowerCase() || "").includes(
        publicSearchQuery.toLowerCase()
      ) ||
      (server.tags || []).some((tag) =>
        tag.toLowerCase().includes(publicSearchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" ||
      server.category === selectedCategory ||
      (selectedCategory === "Uncategorized" && !server.category);

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => server.tags?.includes(tag));

    return matchesSearch && matchesCategory && matchesTags;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPublicServers.length / ITEMS_PER_PAGE);
  const paginatedServers = filteredPublicServers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleJoinServer = async (serverId: string) => {
    try {
      setJoiningServer(serverId);
      const response = await joinServer(serverId, userId);

      if (!response.success) {
        toast({
          title: "Error",
          description: response.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Successfully joined the server!",
      });

      router.refresh();
      router.push(`/servers/${serverId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join server",
        variant: "destructive",
      });
      console.error("Failed to join server:", error);
    } finally {
      setJoiningServer(null);
    }
  };

  return (
    <div className="space-y-6 px-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search servers..."
                value={publicSearchQuery}
                onChange={(e) => {
                  setPublicSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags ({selectedTags.length})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Search tags..."
                      value={searchTag}
                      onChange={(e) => setSearchTag(e.target.value)}
                      className="mb-2"
                    />
                    <div className="max-h-[200px] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-1">
                        {filteredTags.map((tag) => (
                          <div
                            key={tag}
                            className="flex items-center justify-between"
                          >
                            <Badge
                              variant={
                                selectedTags.includes(tag)
                                  ? "default"
                                  : "secondary"
                              }
                              className="cursor-pointer w-full justify-between"
                              onClick={() => {
                                setSelectedTags((prev) =>
                                  prev.includes(tag)
                                    ? prev.filter((t) => t !== tag)
                                    : [...prev, tag]
                                );
                                setCurrentPage(1);
                              }}
                            >
                              <span className="truncate">{tag}</span>
                              <span className="ml-2 text-xs">
                                {tagCounts[tag]}
                              </span>
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedTags([]);
                          setCurrentPage(1);
                        }}
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTags((prev) => prev.filter((t) => t !== tag));
                      setCurrentPage(1);
                    }}
                  >
                    {tag}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {paginatedServers.length} of {filteredPublicServers.length}{" "}
            servers
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Public Servers</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedServers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No servers found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Server</TableHead>
                    <TableHead className="min-w-[150px]">Category</TableHead>
                    <TableHead className="min-w-[100px]">Members</TableHead>
                    <TableHead className="min-w-[120px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedServers.map((server) => (
                    <React.Fragment key={server.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          setExpandedServer(
                            expandedServer === server.id ? null : server.id
                          )
                        }
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={server.imageUrl}
                                alt={server.name}
                              />
                              <AvatarFallback>
                                {server.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{server.name}</div>
                              {expandedServer !== server.id && (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {server.description || "No description"}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {server.category || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {server._count.members.toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              disabled={joiningServer === server.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinServer(server.id);
                              }}
                              className="bg-gradient-to-br from-violet-600 to-indigo-600 text-primary-foreground hover:brightness-110"
                            >
                              {joiningServer === server.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Joining
                                </>
                              ) : (
                                "Join"
                              )}
                            </Button>
                            {expandedServer === server.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedServer === server.id && (
                        <TableRow>
                          <TableCell colSpan={4} className="bg-muted/30">
                            <div className="py-2 space-y-2">
                              <div className="text-sm">
                                <span className="font-semibold">
                                  Description:
                                </span>
                                <p className="text-muted-foreground mt-1">
                                  {server.description ||
                                    "No description available"}
                                </p>
                              </div>
                              {server.tags && server.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {server.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-8 h-8"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
