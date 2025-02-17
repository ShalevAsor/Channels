// src/lib/errors/handle-error.ts
import { AppError } from "./app-error";
import { Prisma } from "@prisma/client";

// Define our response types
type ErrorResponse = {
  success: false;
  error: {
    message: string;
    code: string;
  };
};

type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type ActionResponse<T> = ErrorResponse | SuccessResponse<T>;

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: AppError) => void;
}

export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = { logError: true }
): ErrorResponse {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    },
  };

  // Log error if enabled
  if (options.logError) {
    console.error("Error details:", error);
  }

  // Handle our custom errors
  if (error instanceof AppError) {
    errorResponse.error = {
      message: error.message,
      code: error.code,
    };

    if (options.onError) {
      options.onError(error);
    }
    return errorResponse;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const message = getPrismaErrorMessage(error);
    errorResponse.error = {
      message,
      code: `PRISMA_${error.code}`,
    };
    return errorResponse;
  }

  // Handle other Error instances
  if (error instanceof Error) {
    errorResponse.error.message = error.message;
  }

  return errorResponse;
}

function getPrismaErrorMessage(
  error: Prisma.PrismaClientKnownRequestError
): string {
  switch (error.code) {
    case "P2002":
      return "This name is already in use";
    case "P2025":
      return "Record not found";
    case "P2003":
      return "Operation failed due to related data constraints";
    default:
      return "Database operation failed";
  }
}
