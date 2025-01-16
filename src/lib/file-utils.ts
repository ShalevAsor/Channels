export const getFileType = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("image")) return "image";
    if (contentType?.includes("pdf")) return "pdf";
    if (contentType?.includes("video")) return "video";
    if (contentType?.includes("audio")) return "audio";

    return "file";
  } catch (error) {
    console.error("Error detecting file type:", error);
    return null;
  }
};

// Map of MIME types to file types
export const fileTypeMap = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
  "application/pdf": "pdf",
  "video/mp4": "video",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
} as const;

// Function to extract upload metadata if available
export const getUploadMetadata = (url: string) => {
  const segments = url.split("-");
  const lastSegment = segments[segments.length - 1];

  if (lastSegment?.includes(".")) {
    const extension = lastSegment.split(".").pop()?.toLowerCase();
    if (extension) {
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension))
        return "image";
      if (extension === "pdf") return "pdf";
      if (["mp4", "webm"].includes(extension)) return "video";
      if (["mp3", "wav"].includes(extension)) return "audio";
    }
  }

  return null;
};
