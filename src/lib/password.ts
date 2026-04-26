import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * hashPassword — Securely hashes a plain-text password using bcrypt.
 * 12 rounds is a good balance between security and performance.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * comparePassword — Checks if a plain password matches a stored hash.
 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
