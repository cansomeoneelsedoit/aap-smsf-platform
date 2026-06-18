export class MicrosoftGraphConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MicrosoftGraphConfigError";
  }
}

export class MicrosoftGraphAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MicrosoftGraphAuthError";
  }
}

export class MicrosoftGraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MicrosoftGraphError";
  }
}

export function isMicrosoftGraphError(error: unknown): error is MicrosoftGraphError {
  return error instanceof Error && error.name === "MicrosoftGraphError";
}

export function isMicrosoftGraphConfigError(error: unknown): error is MicrosoftGraphConfigError {
  return error instanceof Error && error.name === "MicrosoftGraphConfigError";
}
