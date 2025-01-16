// src/lib/errors/app-error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = "APP_ERROR"
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Auth-related errors
export class AuthError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, "AUTH_ERROR");
  }
}
export class UserError extends AppError {
  constructor(message: string = "User operation failed") {
    super(message, 400, "USER_ERROR");
  }
}

// Server-related errors
export class ServerError extends AppError {
  constructor(message: string = "Server operation failed") {
    super(message, 400, "SERVER_ERROR");
  }
}

// Channel-related errors
export class ChannelError extends AppError {
  constructor(message: string = "Channel operation failed") {
    super(message, 400, "CHANNEL_ERROR");
  }
}

// Message-related errors
export class MessageError extends AppError {
  constructor(message: string = "Message operation failed") {
    super(message, 400, "MESSAGE_ERROR");
  }
}

// Member-related errors
export class MemberError extends AppError {
  constructor(message: string = "Member operation failed") {
    super(message, 400, "MEMBER_ERROR");
  }
}
