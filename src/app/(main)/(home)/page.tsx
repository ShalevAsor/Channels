import { getServersWithMemberInfo } from "@/actions/server";
import { getPublicServers } from "@/actions/server-discovery";
import Home from "@/components/home/home";
import { currentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

const HomePage = async () => {
  const userId = await currentUserId();
  if (!userId) return redirect("/auth/login");

  const [serversResponse, publicServersResponse] = await Promise.all([
    getServersWithMemberInfo(userId),
    getPublicServers(),
  ]);

  const userServers = serversResponse.success ? serversResponse.data : [];
  const publicServers = publicServersResponse.success
    ? publicServersResponse.data
    : [];

  return (
    <Home
      userServers={userServers}
      publicServers={publicServers}
      userId={userId}
    />
  );
};

export default HomePage;
