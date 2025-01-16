import { getServerWithGeneralChannelByServerAndUserId } from "@/actions/server";
import { currentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

// First, let's properly type our parameters
interface ServerIdPageProps {
  params: Promise<{
    serverId: string;
  }>;
}

// We'll make our page component async since we're doing async operations
const ServerIdPage = async ({ params }: ServerIdPageProps) => {
  // First check authentication
  const userId = await currentUserId();
  if (!userId) {
    return redirect("/auth/login");
  }
  const { serverId } = await params;

  if (!serverId) {
    return redirect("/");
  }

  // Get the server data using our action
  const response = await getServerWithGeneralChannelByServerAndUserId(
    serverId,
    userId
  );
  if (!response.success) {
    return redirect("/");
  }
  const server = response.data;
  if (!server) {
    return redirect("/");
  }

  // Check for the general channel
  const initialChannel = server.channels[0];
  if (!initialChannel || initialChannel.name !== "general") {
    return null;
  }

  // Redirect to the general channel
  return redirect(`/servers/${serverId}/channels/${initialChannel.id}`);
};

export default ServerIdPage;
