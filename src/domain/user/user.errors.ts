/**
 * Domain-specific error types for the User context.
 * These are returned via Result<T, E>, not thrown.
 */

export class EmailAlreadyExistsError extends Error {
  readonly code = 'EMAIL_ALREADY_EXISTS';
  constructor(email: string) {
    super(`A user with email "${email}" already exists.`);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends Error {
  readonly code = 'INVALID_CREDENTIALS';
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export type UserDomainError =
  | EmailAlreadyExistsError
  | InvalidCredentialsError;
