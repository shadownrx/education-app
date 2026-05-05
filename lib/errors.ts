import { NextResponse } from "next/server";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

// Handle API errors safely
export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }

  // Generic error without stack trace exposure
  return NextResponse.json(
    { error: "An error occurred. Please try again later." },
    { status: 500 }
  );
}
