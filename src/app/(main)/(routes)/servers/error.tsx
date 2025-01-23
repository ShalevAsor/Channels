"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppError } from "@/lib/errors/app-error";
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

const SERVER_ERROR_MESSAGES = {
  NO_ACCESS: {
    title: "Access Denied",
    message: "You don't have permission to access this server.",
    action: "View Available Servers",
  },
  RATE_LIMITED: {
    title: "Too Many Requests",
    message: "Please wait a moment before accessing server features.",
    action: "Try Again",
  },
  VOICE_ERROR: {
    title: "Voice Connection Error",
    message: "Unable to connect to voice channel.",
    action: "Retry Connection",
  },
  DEFAULT: {
    title: "Server Error",
    message: "An error occurred while accessing the server.",
    action: "Return to Servers",
  },
};

export default function ServerErrorBoundary({
  error,
  reset,
}: {
  error: (Error | AppError) & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const getErrorType = (error: Error | AppError) => {
    if ("code" in error) {
      return (
        SERVER_ERROR_MESSAGES[
          error.code as keyof typeof SERVER_ERROR_MESSAGES
        ] || SERVER_ERROR_MESSAGES.DEFAULT
      );
    }
    return SERVER_ERROR_MESSAGES.DEFAULT;
  };

  const errorDetails = getErrorType(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-white">
            {errorDetails.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            {errorDetails.message}
          </p>

          <Button
            onClick={() => (window.location.href = "/")}
            className="w-full mb-4"
          >
            Back Home
          </Button>

          <Button onClick={reset} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between"
              >
                Debug Info
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {showDetails && (
                <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <p className="text-sm font-mono">
                    {error.message}
                    {error.digest && ` (${error.digest})`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
