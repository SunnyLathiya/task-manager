import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { verifyToken, type JwtPayload } from '../jwt';

/**
 * Custom request type that includes the authenticated user's identity.
 */
export interface AuthenticatedRequest extends NextApiRequest {
  user: JwtPayload;
}

/**
 * withAuth — Middleware that protects an API route.
 * It extracts the JWT from the Authorization header and verifies it.
 */
export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or invalid token' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token is invalid or expired' });
    }
    
    // Attach user to request and continue
    (req as AuthenticatedRequest).user = decoded;
    return handler(req as AuthenticatedRequest, res);
  };
}
