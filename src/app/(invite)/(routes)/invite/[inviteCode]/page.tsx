// import {
//   getServerByInviteCodeAndUserId,
//   updateServerMemberByInviteCode,
// } from "@/actions/server";
// import { getCurrentUser } from "@/lib/auth";
// import { redirect } from "next/navigation";

// interface InviteCodePageProps {
//   params: {
//     inviteCode: string;
//   };
// }

// const InviteCodePage = async ({ params }: InviteCodePageProps) => {
//   const user = await getCurrentUser();
//   if (!user) {
//     return redirect("/auth/login");
//   }
//   if (!params.inviteCode) {
//     return redirect("/");
//   }
//   const existingServer = await getServerByInviteCodeAndUserId(
//     params.inviteCode,
//     user.id
//   );
//   if (existingServer) {
//     return redirect(`/servers/${existingServer.id}`);
//   }
//   const server = await updateServerMemberByInviteCode(
//     params.inviteCode,
//     user.id
//   );

//   if (server) {
//     return redirect(`/servers/${server.id}`);
//   }

//   return null;
// };

// export default InviteCodePage;
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

  const existingServer = await getServerByInviteCodeAndUserId(
    inviteCode,
    user.id
  );
  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`);
  }

  const server = await updateServerMemberByInviteCode(inviteCode, user.id);

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return null;
};

export default InviteCodePage;
