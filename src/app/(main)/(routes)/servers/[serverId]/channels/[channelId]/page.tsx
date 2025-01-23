import { getChannelById } from "@/actions/channel";
import { getMemberWithUserByServerAndUserId } from "@/actions/member";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { currentUserId } from "@/lib/auth";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";

interface ChannelIdPageProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>;
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const userId = await currentUserId();
  if (!userId) {
    return redirect("/auth/login");
  }

  // Await the params object itself
  const { serverId, channelId } = await params;
  if (!serverId) {
    return redirect("/");
  }
  if (!channelId) {
    return redirect(`/servers/${serverId}`);
  }
  // Handle async operations concurrently
  const [channelResponse, memberResponse] = await Promise.all([
    getChannelById(channelId),
    getMemberWithUserByServerAndUserId(serverId, userId),
  ]);
  if (!channelResponse.success || !memberResponse.success) {
    return redirect(`/servers/${serverId}`);
  }
  const { channel, member } = {
    channel: channelResponse.data,
    member: memberResponse.data,
  };
  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            member={member}
            name={channel.name}
            chatId={channel.id}
            type="channel"
            paramKey="channelId"
            paramValue={channel.id}
            messageParams={{
              // Updated from socketQuery
              channelId: channel.id,
              serverId: channel.serverId,
            }}
          />
          <ChatInput
            name={channel.name}
            type="channel"
            username={member.user.name || "Anonymous"}
            messageParams={{
              // New structure replacing apiUrl and query
              channelId: channel.id,
              serverId: channel.serverId,
              memberId: member.id,
            }}
          />
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channel.id} audio={true} video={false} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} audio={true} video={true} />
      )}
    </div>
  );
};

export default ChannelIdPage;
