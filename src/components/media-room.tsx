"use client";

import { useEffect, useState } from "react";
import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";

import "@livekit/components-styles";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loader2 } from "lucide-react";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
  const user = useCurrentUser();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!user?.name) return;
    (async () => {
      try {
        const response = await fetch(
          `/api/livekit/token?room=${chatId}&username=${user.name}`
        );
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [user?.name, chatId]);

  if (!token) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }
  return (
    <LiveKitRoom
      video={video}
      audio={audio}
      token={token}
      connect={true}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      {/* Your custom component with basic video conferencing functionality. */}
      <MyVideoConference />
      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer />
      {/* Controls for the user to start/stop audio, video, and screen
      share tracks and to leave the room. */}
      {/* <ControlBar /> */}
    </LiveKitRoom>
  );
};

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height) - 100px)" }}
    >
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile />
    </GridLayout>
  );
}
// "use client";

// import { useEffect, useState } from "react";
// import {
//   ControlBar,
//   GridLayout,
//   LiveKitRoom,
//   ParticipantTile,
//   RoomAudioRenderer,
//   useTracks,
// } from "@livekit/components-react";
// import { Track } from "livekit-client";
// import "@livekit/components-styles";
// import { useCurrentUser } from "@/hooks/use-current-user";
// import { Loader2 } from "lucide-react";

// interface MediaRoomProps {
//   chatId: string;
//   video: boolean;
//   audio: boolean;
// }

// export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
//   const user = useCurrentUser();
//   const [token, setToken] = useState("");
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     if (!user?.name) return;

//     const fetchToken = async () => {
//       try {
//         const response = await fetch(
//           `/api/livekit/token?room=${chatId}&username=${user.name}`
//         );
//         const data = await response.json();
//         setToken(data.token);
//       } catch (error) {
//         console.log(error);
//       }
//     };

//     fetchToken();
//   }, [user?.name, chatId]);

//   if (!token) {
//     return (
//       <div className="flex flex-col flex-1 justify-center items-center">
//         <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
//         <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <LiveKitRoom
//       video={video}
//       audio={audio}
//       token={token}
//       connect={true}
//       serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
//       data-lk-theme="default"
//       style={{ height: "100dvh" }}
//       onConnected={() => setIsConnected(true)}
//       onDisconnected={() => setIsConnected(false)}
//     >
//       {isConnected && <MyVideoConference />}
//       <RoomAudioRenderer />
//       {/* <ControlBar /> */}
//     </LiveKitRoom>
//   );
// };

// function MyVideoConference() {
//   const tracks = useTracks(
//     [
//       { source: Track.Source.Camera, withPlaceholder: true },
//       { source: Track.Source.ScreenShare, withPlaceholder: false },
//     ],
//     { onlySubscribed: false }
//   );

//   return (
//     <GridLayout
//       tracks={tracks}
//       style={{ height: "calc(100vh - var(--lk-control-bar-height) - 100px)" }}
//     >
//       <ParticipantTile />
//     </GridLayout>
//   );
// }
