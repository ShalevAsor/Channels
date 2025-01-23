"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppError } from "@/lib/errors/app-error";
import { getGeneralErrorDetails } from "@/lib/errors/error-helper";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Home,
} from "lucide-react";
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: (Error | AppError) & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("Error caught by error boundary:", error);
  }, [error]);

  const errorDetails = getGeneralErrorDetails(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-red-50 to-white dark:from-red-900 dark:to-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-white">
            {errorDetails.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
            {errorDetails.message}
          </p>

          <div className="mt-6 space-y-4">
            <Button
              onClick={reset}
              className="w-full flex items-center justify-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="w-full flex items-center justify-center"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between text-gray-600 dark:text-gray-400"
              >
                Technical Details
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {showDetails && (
                <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <p className="text-sm font-mono text-gray-800 dark:text-gray-200 mb-2">
                    {errorDetails.technical || error.message}
                  </p>
                  {errorDetails.code && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Code: {errorDetails.code}
                    </p>
                  )}
                  {error.digest && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
