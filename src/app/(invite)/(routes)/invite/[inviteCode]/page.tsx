import {
  getServerByInviteCodeAndUserId,
  updateServerMemberByInviteCode,
} from "@/actions/server";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/login");
  }

  const { inviteCode } = await params;
  if (!inviteCode) {
    return redirect("/");
  }

  const responseServer = await getServerByInviteCodeAndUserId(
    inviteCode,
    user.id
  );
  if (!responseServer.success) {
    return redirect("/");
  }
  const existingServer = responseServer.data;
  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`);
  }

  const responseUpdatedServer = await updateServerMemberByInviteCode(
    inviteCode,
    user.id
  );
  if (!responseUpdatedServer.success) {
    return redirect("/");
  }
  const server = responseUpdatedServer.data;
  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return null;
};

export default InviteCodePage;
