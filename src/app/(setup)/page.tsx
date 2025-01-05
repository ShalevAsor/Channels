import { getFirstServer } from "@/actions/server";
import { InitialModal } from "@/components/modals/initial-modal";
import { currentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
const SetupPage = async () => {
  const userId = await currentUserId();
  if (!userId) {
    return redirect("/auth/login");
  }
  const server = await getFirstServer(userId);
  if (server) {
    redirect(`/servers/${server.id}`);
  }
  return <InitialModal />;
};

export default SetupPage;
