import { getServerByServerAndUserId } from "@/actions/server";
import PageLoading from "@/components/loading/page-loading";
import { ServerSidebar } from "@/components/server/server-sidebar";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    serverId: string;
  }>;
}) => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/");
  }
  const { serverId } = await params;
  const response = await getServerByServerAndUserId(serverId, user.id);
  if (!response.success || !response.data) {
    return notFound();
  }
  const server = response.data;
  if (!server) return redirect("/");
  return (
    <div className="h-screen">
      <div className="hidden md:flex flex-col fixed h-full z-20 w-60 inset-y-0">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full md:pl-60">
        <Suspense fallback={<PageLoading />}>{children}</Suspense>
      </main>
    </div>
  );
};
export default ServerIdLayout;
