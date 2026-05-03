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
  const secret = process.env.JWT_SECRET as string;
  return jwt.sign(payload, secret, { expiresIn: '1h', algorithm: 'HS256' });
}

/**
 * verifyToken — Checks if a JWT is valid and returns the payload.
 * Returns null if invalid or expired.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });

    // Runtime payload shape validation
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof (decoded as any).userId !== 'string' ||
      typeof (decoded as any).email !== 'string'
    ) {
      return null;
    }

    return decoded as JwtPayload;
  } catch {
    return null;
  }
}
