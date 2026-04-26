import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * signToken — Creates a signed JWT for the user.
 * We use the userId and email to authorize requests later.
 */
export function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined in environment');
  
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

/**
 * verifyToken — Checks if a JWT is valid and returns the payload.
 * Returns null if invalid or expired.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}
