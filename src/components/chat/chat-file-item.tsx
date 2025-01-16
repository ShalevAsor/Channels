"use client";

import Image from "next/image";
import { FileIcon } from "lucide-react";

interface ChatFileItemProps {
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  content?: string;
}

export const ChatFileItem = ({
  fileUrl,
  fileName,
  fileType,
  content,
}: ChatFileItemProps) => {
  const isImage = fileType?.startsWith("image");
  const isPDF = fileType === "application/pdf";

  if (isImage) {
    return (
      <div className="flex flex-col gap-y-2">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48 group"
        >
          <Image
            src={fileUrl}
            alt={fileName || content || "Image"}
            fill
            className="object-cover"
          />
          {fileName && (
            <div className="absolute bottom-0 w-full p-2 bg-black/40 text-white text-sm truncate opacity-0 group-hover:opacity-100 transition-opacity">
              {fileName}
            </div>
          )}
        </a>
      </div>
    );
  }

  if (isPDF) {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {fileName || "PDF File"}
        </a>
      </div>
    );
  }

  return null;
};
