// "use client";

// import { X } from "lucide-react";
// import Image from "next/image";
// import { UploadDropzone } from "@/lib/uploadthing";
// import { useState } from "react";

// // FileUploadProps: Defines the properties that the FileUpload component accepts.
// interface FileUploadProps {
//   /**
//    * Callback function to handle the uploaded file URL.
//    * If the URL is undefined, the uploaded file is reset.
//    */
//   onChange: (url?: string) => void;

//   /**
//    * Current value of the uploaded file URL.
//    */
//   value: string;

//   /**
//    * Defines the upload destination.
//    * - "messageFile" for messages
//    * - "serverImage" for server images
//    */
//   endpoint: "messageFile" | "serverImage";
// }

// /**
//  * FileUpload Component
//  * Handles file uploads with support for images and PDF files.
//  *
//  * Features:
//  * - Dynamic rendering based on file type.
//  * - Displays a loading spinner while uploading.
//  * - Error handling for file load failures.
//  * - Interactive UI with a drag-and-drop upload zone.
//  *
//  * @param {FileUploadProps} props - Component properties
//  * @returns {JSX.Element} The rendered file upload component.
//  */
// export const FileUpload = ({ endpoint, value, onChange }: FileUploadProps) => {
//   // State to track loading, errors, and file type.
//   const [error, setError] = useState<string | undefined>();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [fileType, setFileType] = useState<string>();

//   // Render image preview if the uploaded file is an image.
//   if (value && fileType?.startsWith("image/")) {
//     return (
//       <div className="relative h-20 w-20">
//         {/* Loading spinner */}
//         {loading && (
//           <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
//             <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
//           </div>
//         )}

//         {/* Display uploaded image */}
//         <Image
//           fill
//           src={value}
//           alt="Uploaded file"
//           onError={() => setError("Failed to load image")}
//           onLoad={() => setLoading(false)}
//           className="rounded-full object-cover"
//           unoptimized // Disables optimization for external URLs
//         />

//         {/* Error message overlay */}
//         {error && (
//           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs">
//             {error}
//           </div>
//         )}

//         {/* Delete button */}
//         <button
//           className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
//           type="button"
//           onClick={() => onChange("")}
//         >
//           <X className="h-4 w-4" />
//         </button>
//       </div>
//     );
//   }

//   // Render PDF preview if the uploaded file is a PDF.
//   if (value && fileType === "application/pdf") {
//     return (
//       <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
//         <div className="ml-2 text-sm text-indigo-500">PDF Document</div>

//         {/* Delete button */}
//         <button
//           className="bg-rose-500 text-white p-1 rounded-full ml-auto hover:bg-rose-600"
//           type="button"
//           onClick={() => onChange("")}
//         >
//           <X className="h-4 w-4" />
//         </button>
//       </div>
//     );
//   }

//   // Default view: Drag-and-drop upload zone.
//   return (
//     <UploadDropzone
//       endpoint={endpoint}
//       onClientUploadComplete={(res) => {
//         if (res?.[0]) {
//           setFileType(res[0].type);
//           onChange(res[0].url);
//           setLoading(true);
//         }
//       }}
//       onUploadError={(err) => {
//         console.error(err);
//       }}
//     />
//   );
// };
import { X } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { useState, useEffect } from "react";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
}

export const FileUpload = ({ endpoint, value, onChange }: FileUploadProps) => {
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [fileType, setFileType] = useState<string>();

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
        <div className="ml-2 text-sm text-indigo-500">PDF Document</div>
        <button
          className="bg-rose-500 text-white p-1 rounded-full ml-auto hover:bg-rose-600"
          type="button"
          onClick={() => {
            onChange("");
            setFileType(undefined);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        if (res?.[0]) {
          setFileType(res[0].type);
          onChange(res[0].url);
          setLoading(true);
        }
      }}
      onUploadError={(err) => {
        console.error(err);
        setError("Upload failed");
      }}
    />
  );
};
