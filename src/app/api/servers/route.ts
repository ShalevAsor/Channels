// import { getCurrentUser } from "@/data/user";
// import { db } from "@/lib/db";
// import { v4 as uuid } from "uuid";
// import { NextResponse } from "next/server";
// import { MemberRole } from "@prisma/client";

// export async function POST(req: Request) {
//   try {
//     const { name, imageUrl } = await req.json();
//     const user = await getCurrentUser();
//     if (!user) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }
//     const server = await db.server.create({
//       data: {
//         userId: user.id,
//         name,
//         imageUrl,
//         inviteCode: uuid(),
//         channels: {
//           create: [{ name: "general", userId: user.id }],
//         },
//         members: {
//           create: [{ userId: user.id, role: MemberRole.ADMIN }],
//         },
//       },
//     });
//     return NextResponse.json(server);
//   } catch (error) {
//     console.log("Error in POST /api/servers/route.ts", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }
