// import { currentUserId } from "@/lib/auth";
// import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { UploadThingError } from "uploadthing/server";

// const f = createUploadthing();
// const handleAuth = async () => {
//   const userId = await currentUserId();
//   if (!userId) throw new Error("Unauthorized");
//   return { userId: userId };
// };

// // FileRouter for your app, can contain multiple FileRoutes
// export const ourFileRouter = {
//   serverImage: f({
//     image: {
//       maxFileSize: "4MB",
//       maxFileCount: 1,
//     },
//   })
//     .middleware(() => handleAuth())
//     .onUploadComplete(() => {}),
//   messageFile: f(["image", "pdf"])
//     .middleware(() => handleAuth())
//     .onUploadComplete(() => {}),
// } satisfies FileRouter;

// export type OurFileRouter = typeof ourFileRouter;
import { currentUserId } from "@/lib/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleAuth = async () => {
  const userId = await currentUserId();
  if (!userId) throw new Error("Unauthorized");
  return { userId: userId };
};

export const ourFileRouter = {
  serverImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(() => handleAuth())
    .onUploadComplete(({ file }) => {
      return { url: file.url, name: file.name, type: file.type };
    }),

  messageFile: f(["image", "pdf"])
    .middleware(() => handleAuth())
    .onUploadComplete(({ file }) => {
      return { url: file.url, name: file.name, type: file.type };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
