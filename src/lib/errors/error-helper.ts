// lib/errors/error-helper.ts
import { AppError } from "./app-error";

// Type for the error details we'll return
interface ErrorDetails {
  title: string;
  message: string;
  technical?: string;
  code?: string;
  statusCode?: number;
}

export function getAppErrorDetails(error: AppError): ErrorDetails {
  // This function handles our custom AppErrors with our specific error codes
  console.log("visited getAppErrorDetails");
  switch (error.code) {
    case "AUTH_ERROR":
      return {
        title: "Authentication Error",
        message: "Please log in to continue",
        code: error.code,
        statusCode: error.statusCode,
      };

    case "SERVER_ERROR":
      return {
        title: "Server Error",
        message: "There was a problem with the server",
        code: error.code,
        statusCode: error.statusCode,
      };

    case "CHANNEL_ERROR":
      return {
        title: "Channel Error",
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      };

    default:
      return {
        title: "Application Error",
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      };
  }
}

export function getGeneralErrorDetails(error: Error): ErrorDetails {
  // Network related errors
  if (
    error.message.includes("Failed to fetch") ||
    error.message.includes("Network request failed")
  ) {
    return {
      title: "Network Error",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
      technical: `Network error: ${error.message}`,
      code: "NETWORK_ERROR",
    };
  }

  // Navigation errors
  if (error.message.includes("NEXT_REDIRECT")) {
    return {
      title: "Navigation Error",
      message:
        "The page you're trying to access is no longer available or has been moved.",
      technical: `Navigation error: ${error.message}`,
      code: "NAVIGATION_ERROR",
    };
  }

  // Not Found errors
  if (
    error.message.includes("404") ||
    error.message.toLowerCase().includes("not found")
  ) {
    return {
      title: "Not Found",
      message:
        "The requested resource could not be found. It may have been deleted or never existed.",
      technical: `Not Found error: ${error.message}`,
      code: "NOT_FOUND",
    };
  }

  // Permission errors
  if (
    error.message.includes("403") ||
    error.message.toLowerCase().includes("forbidden") ||
    error.message.toLowerCase().includes("not authorized")
  ) {
    return {
      title: "Permission Denied",
      message:
        "You don't have permission to access this resource. Please check your credentials or contact support.",
      technical: `Permission error: ${error.message}`,
      code: "PERMISSION_DENIED",
    };
  }

  // Timeout errors
  if (
    error.message.includes("timeout") ||
    error.message.includes("Timed out")
  ) {
    return {
      title: "Request Timeout",
      message:
        "The server is taking too long to respond. Please try again later or contact support if the problem persists.",
      technical: `Timeout error: ${error.message}`,
      code: "TIMEOUT",
    };
  }

  // Server errors
  if (
    error.message.includes("500") ||
    error.message.toLowerCase().includes("server error")
  ) {
    return {
      title: "Server Error",
      message:
        "There was a problem with the server. Please try again later or contact support if the problem persists.",
      technical: `Server error: ${error.message}`,
      code: "SERVER_ERROR",
    };
  }

  // Data parsing errors
  if (
    error.message.includes("JSON") ||
    error.message.includes("Unexpected token")
  ) {
    return {
      title: "Data Error",
      message:
        "There was a problem processing the data. Please try again or contact support if the issue persists.",
      technical: `Data parsing error: ${error.message}`,
      code: "DATA_ERROR",
    };
  }

  // Default error case
  return {
    title: "Unexpected Error",
    message:
      "An unexpected error occurred. Please try again or contact support if the problem persists.",
    technical: `Unhandled error: ${error.message}`,
    code: "UNKNOWN_ERROR",
  };
}
