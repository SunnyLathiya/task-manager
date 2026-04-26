/**
 * Result type — a discriminated union for returning either a success value
 * or a typed error, without throwing exceptions for expected domain failures.
 */

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/** Convenience constructor for a successful result */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Convenience constructor for a failed result */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
