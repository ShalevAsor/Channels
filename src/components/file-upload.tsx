import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { useState, useEffect } from "react";

interface FileUploadProps {
  onChange: (url?: string, file?: { name: string; type: string }) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
}

export const FileUpload = ({ endpoint, value, onChange }: FileUploadProps) => {
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [fileType, setFileType] = useState<string>();
  const [originalFileName, setOriginalFileName] = useState<string>();

  // Add this useEffect to handle initial image
  useEffect(() => {
    if (value && !fileType) {
      // If we have a value but no fileType, assume it's an image
      setFileType("image/jpeg");
    }
  }, [value, fileType]);

  // Show image preview if we have a value (existing image) or if it's a new image upload
  if (
    value &&
    (fileType?.startsWith("image/") ||
      value.match(/\.(jpg|jpeg|png|gif|webp)$/i))
  ) {
    return (
      <div className="relative h-20 w-20">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
            <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        <Image
          fill
          src={value}
          alt="Upload"
          onError={() => setError("Failed to load image")}
          onLoad={() => setLoading(false)}
          className="rounded-full object-cover"
          unoptimized
        />

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs">
            {error}
          </div>
        )}

        <button
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
          onClick={() => {
            onChange("");
            setFileType(undefined);
            setOriginalFileName(undefined);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && fileType === "application/pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <div className="ml-2 flex flex-col overflow-hidden">
          <span className="text-sm text-indigo-500 truncate">
            {originalFileName || "PDF Document"}
          </span>
          <span className="text-xs text-zinc-400">PDF Document</span>
        </div>
        <button
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm hover:bg-rose-600"
          type="button"
          onClick={() => {
            onChange("");
            setFileType(undefined);
            setOriginalFileName(undefined);
          }}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        if (res?.[0]) {
          const file = res[0];
          setFileType(file.type);
          setOriginalFileName(file.name);
          setLoading(true);
          // Pass both URL and file metadata
          onChange(file.url, {
            name: file.name,
            type: file.type,
          });
        }
      }}
    />
  );
};
