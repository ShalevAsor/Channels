import { redirect } from "next/navigation";
import { getMemberWithUserByServerAndUserId } from "@/actions/member";
import { currentUserId } from "@/lib/auth";
import { getOrCreateConversation } from "@/actions/conversation";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/media-room";

interface MemberIdPageProps {
  params: Promise<{
    memberId: string;
    serverId: string;
  }>;
  searchParams: Promise<{
    video?: string;
  }>;
}

const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
  // Await params and searchParams
  const { memberId, serverId } = await params;
  const { video } = await searchParams;

  const userId = await currentUserId();
  if (!userId) {
    return redirect("/auth/login");
  }
  const [currentMemberResponse] = await Promise.all([
    getMemberWithUserByServerAndUserId(serverId, userId),
  ]);
  if (!currentMemberResponse.success) {
    return redirect("/");
  }
  const currentMember = currentMemberResponse.data;
  if (!currentMember) {
    return redirect("/");
  }
  const conversationResponse = await getOrCreateConversation(
    currentMember.id,
    memberId
  );
  if (!conversationResponse.success) {
    return redirect(`/servers/${serverId}`);
  }
  const conversation = conversationResponse.data;
  if (!conversation) {
    return redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;
  const otherMember = memberOne.userId === userId ? memberTwo : memberOne;

  // Convert video to boolean
  const isVideo = video === "true";

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.user.image || undefined}
        name={otherMember.user.name || ""}
        serverId={serverId}
        type="conversation"
      />
      {isVideo && (
        <MediaRoom video={true} audio={true} chatId={conversation.id} />
      )}
      {!isVideo && (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.user.name || ""}
            chatId={conversation.id}
            type="conversation"
            paramKey="conversationId"
            paramValue={conversation.id}
            messageParams={{
              conversationId: conversation.id,
              serverId: serverId,
            }}
          />

          <ChatInput
            name={otherMember.user.name || ""}
            type="conversation"
            username={currentMember.user.name || "Anonymous"}
            messageParams={{
              conversationId: conversation.id,
              memberId: currentMember.id,
              serverId: serverId,
            }}
          />
        </>
      )}
    </div>
  );
};

export default MemberIdPage;
