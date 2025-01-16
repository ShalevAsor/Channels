import { currentUser, currentUserId } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";
/**
 * Handles Pusher channel authentication requests
 * This endpoint is called automatically by Pusher client when joining presence channels
 */
export async function POST(req: Request) {
  try {
    // First security check: Verify user is authenticated
    const user = await currentUser();
    if (!user || !user.id) {
      console.log("[PUSHER_AUTH] Unauthorized: No user ID");
      return new NextResponse("Unauthorized", { status: 401 });
    }
    // Parse the Pusher authentication request body
    // Pusher sends data in URL-encoded format: socket_id=1234&channel_name=presence-chat-123
    const body = await req.text();
    // Extract socket_id and channel_name from the request body
    const [socketId, channelName] = body
      .split("&")
      .map((str) => str.split("=")[1]);
    // Validate required parameters are present
    if (!socketId || !channelName) {
      console.log("[PUSHER_AUTH] Invalid request parameters");
      return new NextResponse("Bad Request", { status: 400 });
    }
    // Prepare user data to be associated with the presence channel
    // This data will be available to other channel members
    const userData = {
      user_id: user.id,
      user_info: { id: user.id, name: user.name, imageUrl: user.image },
    };

    // Generate authentication signature for the channel
    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channelName,
      userData
    );

    // Return authentication token to the client
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("[PUSHER_AUTH] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
