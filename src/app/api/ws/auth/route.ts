// app/api/ws/auth/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { sign } from "jsonwebtoken";
import { WebSocketAuthToken } from "@/lib/websocket";

const WS_JWT_SECRET = process.env.WS_JWT_SECRET!;

export async function GET() {
  try {
    // Use your existing auth to get current user
    const user = await currentUser();

    if (!user || !user.id) {
      console.log("[WS_AUTH] Unauthorized: No user found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create a token with user information
    const tokenPayload: WebSocketAuthToken = {
      userId: user.id,
      name: user.name ?? null, // Convert undefined to null
      image: user.image ?? null, // Convert undefined to null
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    // Sign the token
    const token = sign(tokenPayload, WS_JWT_SECRET);

    console.log("[WS_AUTH] Generated token for user:", user.id);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("[WS_AUTH] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
