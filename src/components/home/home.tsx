"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Navbar } from "./navbar";
import { PublicServers } from "./public-servers";
import { UserServers } from "./user-servers";
import { ServerWithMemberCount, ServerWithMemberInfo } from "@/types/server";

interface HomeProps {
  userId: string;
  userServers: ServerWithMemberInfo[];
  publicServers: ServerWithMemberCount[];
}
export default function Home({
  userServers,
  publicServers,
  userId,
}: HomeProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discover">Discover Servers</TabsTrigger>
            <TabsTrigger value="your-servers">Your Servers</TabsTrigger>
          </TabsList>
          <TabsContent value="discover">
            <PublicServers servers={publicServers} userId={userId} />
          </TabsContent>
          <TabsContent value="your-servers">
            <UserServers servers={userServers} userId={userId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
