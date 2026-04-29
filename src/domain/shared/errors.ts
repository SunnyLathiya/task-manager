export class ValidationError extends Error {
  public readonly code = 'VALIDATION_ERROR';
  constructor(public message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
